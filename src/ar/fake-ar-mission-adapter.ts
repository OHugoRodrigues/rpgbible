import type { ArMissionAdapter, ThrowResult } from '@/src/ar/ar-mission-adapter';

export class FakeArMissionAdapter implements ArMissionAdapter {
  public started = false;
  public placed = false;
  public disposed = false;

  constructor(private readonly supported = true, private readonly result: ThrowResult = 'hit') {}

  async isSupported(): Promise<boolean> { return this.supported }
  async start(_container: HTMLElement): Promise<void> {
    if (!this.supported) throw new Error('immersive-ar is not supported.');
    this.started = true;
  }
  placeScene(): void {
    if (!this.started) throw new Error('AR session has not started.');
    this.placed = true;
  }
  async throwStone(): Promise<ThrowResult> { return this.placed ? this.result : 'miss' }
  dispose(): void { this.disposed = true; this.started = false }
}
