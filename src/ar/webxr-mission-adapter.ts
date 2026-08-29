import type { ArMissionAdapter, ThrowResult } from '@/src/ar/ar-mission-adapter';
import { goliathDataUri } from '@/components/art/goliath';
import type * as Three from 'three';

/** Caminho da arte definitiva; quando ausente, o SVG compartilhado é usado. */
const GOLIATH_SPRITE = '/assets/characters/goliath.png';
const DAVID_SPRITE = '/assets/characters/pilgrim-male.png';

export class WebXrMissionAdapter implements ArMissionAdapter {
  private container: HTMLElement | null = null;
  private renderer: Three.WebGLRenderer | null = null;
  private scene: Three.Scene | null = null;
  private camera: Three.PerspectiveCamera | null = null;
  private reticle: Three.Mesh | null = null;
  private missionGroup: Three.Group | null = null;
  private goliath: Three.Sprite | null = null;
  private goliathShadow: Three.Mesh | null = null;
  private hitTestSource: XRHitTestSource | null = null;
  private referenceSpace: XRReferenceSpace | null = null;
  private session: XRSession | null = null;
  private placed = false;
  private initialized = false;
  private defeated = false;

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
    this.reticle.visible = false;
    this.placed = true;
  }

  /**
   * Lança a pedra em arco, com rastro, e faz Golias reagir ao impacto.
   * O acerto vibra o controle quando o aparelho oferece atuador háptico.
   */
  async throwStone(): Promise<ThrowResult> {
    if (!this.placed || !this.missionGroup || !this.goliath || this.defeated) return 'miss';
    const THREE = await import('three');

    const stone = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x9aa1a6, roughness: 0.85 }),
    );
    const trail = this.createTrail(THREE);
    this.missionGroup.add(stone, trail);

    const from = new THREE.Vector3(-0.42, 0.42, 0.05);
    const to = new THREE.Vector3(0.4, 0.78, 0);
    const duration = 620;
    const start = performance.now();

    await new Promise<void>((resolve) => {
      const step = (time: number) => {
        const progress = Math.min((time - start) / duration, 1);
        stone.position.lerpVectors(from, to, progress);
        stone.position.y += Math.sin(progress * Math.PI) * 0.34;
        this.pushTrail(trail, stone.position);
        if (progress < 1) {
          requestAnimationFrame(step);
          return;
        }
        resolve();
      };
      requestAnimationFrame(step);
    });

    this.missionGroup.remove(stone, trail);
    stone.geometry.dispose();
    (stone.material as Three.Material).dispose();
    trail.geometry.dispose();
    (trail.material as Three.Material).dispose();

    this.defeated = true;
    this.pulseHaptics();
    await this.playImpact();
    return 'hit';
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
    this.goliathShadow = null;
    this.hitTestSource = null;
    this.referenceSpace = null;
    this.placed = false;
    this.initialized = false;
    this.defeated = false;
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
    this.scene.add(new THREE.HemisphereLight(0xfff0d8, 0x445566, 2.4));

    this.reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.11, 0.15, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xf3bd59, transparent: true, opacity: 0.9 }),
    );
    this.reticle.matrixAutoUpdate = false;
    this.reticle.visible = false;
    this.scene.add(this.reticle);

    await this.createMissionScene(THREE);
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

  /** Sprites planos ancorados na superfície, com sombra projetada no chão. */
  private async createMissionScene(THREE: typeof import('three')): Promise<void> {
    this.missionGroup = new THREE.Group();
    this.missionGroup.visible = false;

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(1.05, 40).rotateX(-Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x6a5439, transparent: true, opacity: 0.5 }),
    );

    const goliathTexture = await this.loadTexture(THREE, GOLIATH_SPRITE, goliathDataUri());
    this.goliath = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: goliathTexture ?? undefined, transparent: true }),
    );
    this.goliath.scale.set(0.62, 1.14, 1);
    this.goliath.position.set(0.4, 0.57, 0);

    const davidTexture = await this.loadTexture(THREE, DAVID_SPRITE, null);
    const david = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: davidTexture ?? undefined, transparent: true }),
    );
    david.scale.set(0.34, 0.62, 1);
    david.position.set(-0.42, 0.31, 0.05);

    this.goliathShadow = this.createShadow(THREE, 0.4, 0.22);
    const davidShadow = this.createShadow(THREE, -0.42, 0.12);

    this.missionGroup.add(ground, davidShadow, this.goliathShadow, david, this.goliath);
    this.scene!.add(this.missionGroup);
  }

  private createShadow(THREE: typeof import('three'), x: number, radius: number): Three.Mesh {
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(radius, 24).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.34 }),
    );
    shadow.position.set(x, 0.002, 0);
    return shadow;
  }

  private createTrail(THREE: typeof import('three')): Three.Line {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(180), 3));
    geometry.setDrawRange(0, 0);
    return new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: 0xffe6a8, transparent: true, opacity: 0.75 }),
    );
  }

  private pushTrail(trail: Three.Line, position: Three.Vector3): void {
    const attribute = trail.geometry.getAttribute('position') as Three.BufferAttribute;
    const count = trail.geometry.drawRange.count;
    if (count >= attribute.count) return;
    attribute.setXYZ(count, position.x, position.y, position.z);
    attribute.needsUpdate = true;
    trail.geometry.setDrawRange(0, count + 1);
  }

  /** Recuo, tombo e desaparecimento — a reação que confirma o acerto. */
  private async playImpact(): Promise<void> {
    const goliath = this.goliath;
    const shadow = this.goliathShadow;
    if (!goliath) return;
    const material = goliath.material as Three.SpriteMaterial;
    const baseY = goliath.position.y;
    const start = performance.now();
    const duration = 900;

    await new Promise<void>((resolve) => {
      const step = (time: number) => {
        const progress = Math.min((time - start) / duration, 1);
        const recoil = Math.sin(Math.min(progress * 4, 1) * Math.PI) * 0.06;
        material.rotation = progress * (Math.PI / 2);
        goliath.position.x = 0.4 + recoil;
        goliath.position.y = baseY - progress * (baseY - 0.3);
        material.opacity = 1 - progress * 0.85;
        if (shadow) (shadow.material as Three.Material).opacity = 0.34 * (1 - progress);
        if (progress < 1) {
          requestAnimationFrame(step);
          return;
        }
        goliath.visible = false;
        resolve();
      };
      requestAnimationFrame(step);
    });
  }

  private pulseHaptics(): void {
    const sources = this.session?.inputSources;
    if (!sources) return;
    for (const source of sources) {
      const actuator = source.gamepad?.hapticActuators?.[0];
      if (actuator && 'pulse' in actuator) {
        void (actuator as { pulse(intensity: number, duration: number): Promise<boolean> })
          .pulse(0.8, 140)
          .catch(() => undefined);
      }
    }
  }

  /**
   * Carrega a arte preferida e cai para a alternativa se o arquivo não existir.
   * Devolve `null` quando nenhuma das duas está disponível.
   */
  private async loadTexture(
    THREE: typeof import('three'),
    preferred: string,
    fallback: string | null,
  ): Promise<Three.Texture | null> {
    const loader = new THREE.TextureLoader();
    const load = (url: string) =>
      new Promise<Three.Texture | null>((resolve) => {
        loader.load(
          url,
          (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.magFilter = THREE.NearestFilter;
            resolve(texture);
          },
          undefined,
          () => resolve(null),
        );
      });

    return (await load(preferred)) ?? (fallback ? await load(fallback) : null);
  }
}
