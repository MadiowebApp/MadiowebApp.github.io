// Web Notification Permission Handler
window.notificationHandler = {
    // Check if notifications are supported
    isSupported: function () {
        return 'Notification' in window;
    },

    // Get current permission status
    getPermission: function () {
        if (!this.isSupported()) return 'denied';
        return Notification.permission;
    },

    // Request notification permission
    requestPermission: function () {
        if (!this.isSupported()) {
            return Promise.resolve('denied');
        }

        // For newer browsers
        if (Notification.requestPermission) {
            return Notification.requestPermission();
        }

        // Fallback for older browsers
        return new Promise(function (resolve) {
            Notification.requestPermission(function (permission) {
                resolve(permission);
            });
        });
    },

    // Show a notification
    showNotification: function (title, options) {
        if (!this.isSupported() || Notification.permission !== 'granted') {
            console.log('Notifications not permitted');
            return null;
        }

        const notification = new Notification(title, {
            body: options.body || '',
            icon: options.icon || '/icons/Icon-192.png',
            badge: options.badge || '/icons/Icon-192.png',
            tag: options.tag || 'madio-express',
            requireInteraction: options.requireInteraction || false,
            silent: options.silent || false,
            data: options.data || {}
        });

        // Auto close after 5 seconds if not requiring interaction
        if (!options.requireInteraction) {
            setTimeout(() => {
                notification.close();
            }, 5000);
        }

        // Handle click events
        notification.onclick = function (event) {
            event.preventDefault();
            window.focus();
            notification.close();

            // Call Flutter callback if provided
            if (options.onClick && typeof options.onClick === 'function') {
                options.onClick(options.data);
            }
        };

        return notification;
    }
}; 