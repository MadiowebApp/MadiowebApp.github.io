// Service Worker for Native Notifications
const CACHE_NAME = 'madio-express-notifications-v1';
const NOTIFICATION_TAG = 'madio-express-notification';

// Install event
self.addEventListener('install', (event) => {
    console.log('Notification Service Worker installed');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Notification Service Worker activated');
    event.waitUntil(self.clients.claim());
});

// Message event (for communication with main app)
self.addEventListener('message', (event) => {
    console.log('Service Worker received message:', event.data);

    if (event.data.type === 'INIT') {
        console.log('Service Worker initialized with:', event.data.data);
    } else if (event.data.type === 'SHOW_NOTIFICATION') {
        showNotification(event.data.data);
    }
});

// Push event (for push notifications if you add them later)
self.addEventListener('push', (event) => {
    console.log('Push event received:', event);

    if (event.data) {
        const data = event.data.json();
        showNotification(data);
    }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);

    event.notification.close();

    // Handle different actions
    if (event.action === 'open' || !event.action) {
        // Open the app
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then((clientList) => {
                // Check if there's already a window/tab open
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If no window/tab is open, open a new one
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    } else if (event.action === 'close') {
        // Just close the notification (already done above)
    } else {
        // Handle custom actions
        event.waitUntil(
            clients.matchAll().then((clientList) => {
                for (const client of clientList) {
                    client.postMessage({
                        type: 'NOTIFICATION_ACTION',
                        action: event.action,
                        payload: event.notification.data?.payload
                    });
                }
            })
        );
    }
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
    console.log('Notification closed:', event);
});

function showNotification(data) {
    const { title, body, icon, tag, actions, payload } = data;

    const notificationOptions = {
        body: body || '',
        icon: icon || '/icons/Icon-192.png',
        badge: '/icons/Icon-192.png',
        tag: tag || NOTIFICATION_TAG,
        data: { payload },
        requireInteraction: false,
        silent: false,
        vibrate: [200, 100, 200],
    };

    // Add actions if provided
    if (actions && actions.length > 0) {
        notificationOptions.actions = actions.map(action => ({
            action: action.toLowerCase().replaceAll(' ', '_'),
            title: action,
            icon: '/icons/Icon-192.png'
        }));
    }

    return self.registration.showNotification(title, notificationOptions);
}

// Background sync (for offline notifications)
self.addEventListener('sync', (event) => {
    console.log('Background sync event:', event);

    if (event.tag === 'background-notification') {
        event.waitUntil(handleBackgroundSync());
    }
});

async function handleBackgroundSync() {
    try {
        // Handle any background sync tasks here
        console.log('Processing background sync');
    } catch (error) {
        console.error('Background sync error:', error);
    }
} 