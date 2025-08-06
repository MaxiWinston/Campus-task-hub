import { useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';

const DEMO_NOTIFICATIONS = [
  {
    type: 'info' as const,
    title: 'Welcome to Campus TaskHub!',
    message: 'Get started by browsing tasks or creating your own.',
  },
  {
    type: 'success' as const,
    title: 'Task Completed!',
    message: 'Your task "Help with Calculus Homework" has been marked as completed.',
  },
  {
    type: 'warning' as const,
    title: 'Task Deadline Approaching',
    message: 'Your task "Moving Help" is due in 2 days.',
    action: {
      label: 'View Task',
      onClick: () => {
        // Navigate to task details
        console.log('Navigating to task details');
      },
    },
  },
  {
    type: 'error' as const,
    title: 'Payment Failed',
    message: 'There was an issue processing your payment method.',
    action: {
      label: 'Update Payment',
      onClick: () => {
        // Navigate to payment settings
        console.log('Navigating to payment settings');
      },
    },
  },
];

export function useDemoNotifications() {
  const { addNotification, clearNotifications } = useNotifications();

  // Add demo notifications on mount
  useEffect(() => {
    // Clear any existing notifications first
    clearNotifications();

    // Add demo notifications with a delay
    const timeouts = DEMO_NOTIFICATIONS.map((notification, index) => {
      return setTimeout(() => {
        addNotification(
          notification.type,
          notification.title,
          notification.message,
          notification.action
        );
      }, 1000 * (index + 1)); // Stagger notifications by 1 second
    });

    // Cleanup timeouts on unmount
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [addNotification, clearNotifications]);

  return { addNotification };
}
