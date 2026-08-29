import type {
  RecoveryNotification,
  RecoveryNotificationAdapter,
} from '@/src/games/types';

export class BrowserRecoveryNotifier implements RecoveryNotificationAdapter {
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  schedule(notification: RecoveryNotification): void {
    this.cancel(notification.id);
    if (
      typeof window === 'undefined' ||
      typeof Notification === 'undefined' ||
      Notification.permission !== 'granted'
    )
      return;
    const delay = Math.max(
      0,
      Date.parse(notification.availableAt) - Date.now(),
    );
    const timer = setTimeout(() => {
      new Notification(notification.title, {
        body: notification.body,
        tag: notification.id,
      });
      this.timers.delete(notification.id);
    }, delay);
    this.timers.set(notification.id, timer);
  }

  cancel(id: string): void {
    const timer = this.timers.get(id);
    if (timer) clearTimeout(timer);
    this.timers.delete(id);
  }

  dispose(): void {
    for (const timer of this.timers.values()) clearTimeout(timer);
    this.timers.clear();
  }
}
