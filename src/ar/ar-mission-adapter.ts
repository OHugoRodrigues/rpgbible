export type ThrowResult = 'hit' | 'miss';

export interface ArMissionAdapter {
  isSupported(): Promise<boolean>;
  start(container: HTMLElement): Promise<void>;
  placeScene(): void;
  throwStone(): Promise<ThrowResult>;
  dispose(): void;
}
