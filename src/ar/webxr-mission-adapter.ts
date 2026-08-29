import type { ArMissionAdapter, ThrowResult } from '@/src/ar/ar-mission-adapter';
import type * as Three from 'three';

export class WebXrMissionAdapter implements ArMissionAdapter {
  private container: HTMLElement | null = null;
  private renderer: Three.WebGLRenderer | null = null;
  private scene: Three.Scene | null = null;
  private camera: Three.PerspectiveCamera | null = null;
  private reticle: Three.Mesh | null = null;
  private missionGroup: Three.Group | null = null;
  private goliath: Three.Group | null = null;
  private hitTestSource: XRHitTestSource | null = null;
  private referenceSpace: XRReferenceSpace | null = null;
  private session: XRSession | null = null;
  private placed = false;
  private initialized = false;

  async isSupported(): Promise<boolean> {
    if (typeof navigator === 'undefined') return false;
    const xr = navigator.xr;
    return xr ? xr.isSessionSupported('immersive-ar') : false;
  }

  async start(container: HTMLElement): Promise<void> {
    if (!(await this.isSupported())) throw new Error('immersive-ar is not supported by this device.');
    await this.setupRenderer(container);
    const xr = navigator.xr;
    if (!xr) throw new Error('WebXR is unavailable.');
    const session = await xr.requestSession('immersive-ar', {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay'],
      domOverlay: { root: container },
    });
    await this.renderer!.xr.setSession(session);
    await this.initializeSession(session);
  }

  async mountLaunchButton(container: HTMLElement): Promise<HTMLElement> {
    await this.setupRenderer(container);
    const { ARButton } = await import('three/addons/webxr/ARButton.js');
    const button = ARButton.createButton(this.renderer!, {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay'],
      domOverlay: { root: container },
    });
    this.renderer!.xr.addEventListener('sessionstart', () => {
      const session = this.renderer?.xr.getSession();
      if (session) void this.initializeSession(session);
    });
    container.appendChild(button);
    return button;
  }

  placeScene(): void {
    if (!this.missionGroup || !this.reticle || !this.reticle.visible) return;
    this.missionGroup.position.setFromMatrixPosition(this.reticle.matrix);
    this.missionGroup.visible = true;
    this.placed = true;
  }

  async throwStone(): Promise<ThrowResult> {
    if (!this.placed || !this.missionGroup || !this.goliath) return 'miss';
    const THREE = await import('three');
    const stone = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x8a7356, roughness: 0.9 }),
    );
    stone.position.set(-0.45, 0.55, 0.15);
    this.missionGroup.add(stone);
    const start = performance.now();
    const duration = 700;
    return new Promise((resolve) => {
      const animate = (time: number) => {
        const progress = Math.min((time - start) / duration, 1);
        stone.position.set(-0.45 + progress * 0.9, 0.55 + Math.sin(progress * Math.PI) * 0.35, 0.15 - progress * 0.15);
        if (progress < 1) return void requestAnimationFrame(animate);
        this.goliath!.rotation.z = -Math.PI / 2;
        resolve('hit');
      };
      requestAnimationFrame(animate);
    });
  }

  dispose(): void {
    this.renderer?.setAnimationLoop(null);
    const session = this.session;
    this.session = null;
    if (session) void session.end().catch(() => undefined);
    this.hitTestSource?.cancel();
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
    this.container = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.reticle = null;
    this.missionGroup = null;
    this.goliath = null;
    this.hitTestSource = null;
    this.referenceSpace = null;
    this.placed = false;
    this.initialized = false;
  }

  private async setupRenderer(container: HTMLElement): Promise<void> {
    if (this.renderer) return;
    const THREE = await import('three');
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.xr.enabled = true;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 2.2));
    this.reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.12, 0.16, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xd8b35c }),
    );
    this.reticle.matrixAutoUpdate = false;
    this.reticle.visible = false;
    this.scene.add(this.reticle);
    this.createMissionPrimitives(THREE);
  }

  private async initializeSession(session: XRSession): Promise<void> {
    if (this.initialized) return;
    this.session = session;
    const viewerSpace = await session.requestReferenceSpace('viewer');
    this.referenceSpace = await session.requestReferenceSpace('local');
    if (!session.requestHitTestSource) throw new Error('WebXR hit-test is not supported by this session.');
    this.hitTestSource = (await session.requestHitTestSource({ space: viewerSpace })) ?? null;
    if (!this.hitTestSource) throw new Error('Unable to create a WebXR hit-test source.');
    session.addEventListener('end', () => this.dispose(), { once: true });
    this.renderer!.setAnimationLoop((_time, frame) => {
      if (frame && this.hitTestSource && this.referenceSpace && !this.placed) {
        const hit = frame.getHitTestResults(this.hitTestSource)[0];
        this.reticle!.visible = Boolean(hit);
        if (hit) {
          const pose = hit.getPose(this.referenceSpace);
          if (pose) this.reticle!.matrix.fromArray(pose.transform.matrix);
        }
      }
      this.renderer!.render(this.scene!, this.camera!);
    });
    this.initialized = true;
  }

  private createMissionPrimitives(THREE: typeof import('three')): void {
    this.missionGroup = new THREE.Group();
    this.missionGroup.visible = false;
    const david = new THREE.Group();
    david.add(new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.35, 4, 8), new THREE.MeshStandardMaterial({ color: 0xc49a6c })));
    david.position.set(-0.45, 0.35, 0);
    this.goliath = new THREE.Group();
    this.goliath.add(new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.65, 4, 8), new THREE.MeshStandardMaterial({ color: 0x5b4636, metalness: 0.25 })));
    this.goliath.position.set(0.45, 0.55, 0);
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(1.1, 32).rotateX(-Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x6a5439, transparent: true, opacity: 0.72 }),
    );
    this.missionGroup.add(ground, david, this.goliath);
    this.scene!.add(this.missionGroup);
  }
}
