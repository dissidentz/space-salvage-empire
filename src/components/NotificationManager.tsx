import { useGameStore } from '@/stores/gameStore';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function NotificationManager() {
  const notifications = useGameStore(state => state.ui.notifications);
  
  // Keep track of processed notification IDs to avoid duplicates
  const processedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    notifications.forEach(notification => {
      if (!processedIds.current.has(notification.id)) {
        processedIds.current.add(notification.id);

        // Display toast based on type
        switch (notification.type) {
          case 'success':
            toast.success(notification.message);
            break;
          case 'error':
            toast.error(notification.message);
            break;
          case 'warning':
            toast.warning(notification.message);
            break;
          case 'info':
          default:
            toast.info(notification.message);
            break;
        }

        // We don't need to clear it from the store immediately if the store handles auto-removal,
        // but we should ensure we don't process it again.
        // The store's auto-remove logic (setTimeout) will handle removal from state.
      }
    });

    // Cleanup processed IDs for notifications that have been removed from store
    const currentIds = new Set(notifications.map(n => n.id));
    for (const id of processedIds.current) {
      if (!currentIds.has(id)) {
        processedIds.current.delete(id);
      }
    }
  }, [notifications]);

  return null; // This component doesn't render anything itself
}
