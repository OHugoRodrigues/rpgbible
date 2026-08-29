import { FakeArMissionAdapter } from '@/src/ar/fake-ar-mission-adapter';
import { describe, expect, it } from 'vitest';

describe('fake AR adapter', () => {
  it('models the start, place, throw and dispose lifecycle', async () => {
    const adapter = new FakeArMissionAdapter(true, 'hit');
    expect(await adapter.isSupported()).toBe(true);
    await adapter.start({} as HTMLElement);
    expect(await adapter.throwStone()).toBe('miss');
    adapter.placeScene();
    expect(await adapter.throwStone()).toBe('hit');
    adapter.dispose();
    expect(adapter.disposed).toBe(true);
  });
});
