"use strict";

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.loadNotifications();
        this.checkForNewContent();
    }

    loadNotifications() {
        const stored = localStorage.getItem('notifications');
        if (stored) {
            this.notifications = JSON.parse(stored);
        }
    }

    saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }

    addNotification(notification) {
        const newNotification = {
            id: Date.now().toString(),
            ...notification,
            createdAt: new Date().toISOString(),
            read: false
        };
        
        this.notifications.unshift(newNotification);
        this.saveNotifications();
        this.showNotificationToast(newNotification);
        this.updateNotificationBadge();
        
        return newNotification;
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            this.updateNotificationBadge();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.saveNotifications();
        this.updateNotificationBadge();
    }

    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    getNotifications(limit = 10) {
        return this.notifications.slice(0, limit);
    }

    showNotificationToast(notification) {
        if (!('Notification' in window)) {
            console.log('This browser does not support desktop notification');
            return;
        }

        if (Notification.permission === 'granted') {
            this.createDesktopNotification(notification);
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.createDesktopNotification(notification);
                }
            });
        }

        this.createInAppNotification(notification);
    }

    createDesktopNotification(notification) {
        const desktopNotification = new Notification(notification.title, {
            body: notification.message,
            icon: '/assets/images/notification-icon.png',
            tag: notification.id
        });

        desktopNotification.onclick = () => {
            window.focus();
            this.handleNotificationClick(notification);
            desktopNotification.close();
        };

        setTimeout(() => {
            desktopNotification.close();
        }, 5000);
    }

    createInAppNotification(notification) {
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.innerHTML = `
            <div class="notification-content">
                <h4>${notification.title}</h4>
                <p>${notification.message}</p>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;

        toast.onclick = () => {
            this.handleNotificationClick(notification);
            toast.remove();
        };

        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    handleNotificationClick(notification) {
        this.markAsRead(notification.id);
        
        if (notification.action) {
            switch (notification.action.type) {
                case 'open_lesson':
                    window.location.hash = '#lesson';
                    loadComponent('pages/lesson.html', 'page-container');
                    break;
                case 'open_quiz':
                    window.location.hash = '#quiz';
                    loadComponent('pages/quiz.html', 'page-container');
                    break;
                case 'open_dashboard':
                    window.location.hash = '#dashboard';
                    loadComponent('pages/dashboard.html', 'page-container');
                    break;
            }
        }
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notification-badge');
        if (badge) {
            const unreadCount = this.getUnreadCount();
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    }

    async checkForNewContent() {
        try {
            const response = await fetch('data/course-structure.json');
            const courseData = await response.json();
            
            const lastCheck = localStorage.getItem('lastContentCheck');
            const now = new Date().toISOString();
            
            if (!lastCheck) {
                localStorage.setItem('lastContentCheck', now);
                this.addNotification({
                    title: 'Willkommen bei Dao-Yu-101!',
                    message: 'Entdecke die Lerninseln und beginne deine Reise.',
                    type: 'welcome',
                    action: { type: 'open_dashboard' }
                });
                return;
            }

            courseData.course.islands.forEach(island => {
                island.lessons.forEach(lesson => {
                    const progress = progressManager.getLessonProgress(lesson.id);
                    if (!progress.lastAccessed) {
                        this.addNotification({
                            title: 'Neue Lektion verfügbar',
                            message: `${lesson.title} auf der Insel ${island.name} ist jetzt verfügbar.`,
                            type: 'new_lesson',
                            action: { 
                                type: lesson.type === 'quiz' ? 'open_quiz' : 'open_lesson',
                                lessonId: lesson.id
                            }
                        });
                    }
                });
            });

            localStorage.setItem('lastContentCheck', now);
        } catch (error) {
            console.error('Failed to check for new content:', error);
        }
    }

    createNotificationPanel() {
        const panel = document.createElement('div');
        panel.id = 'notification-panel';
        panel.className = 'notification-panel';
        panel.innerHTML = `
            <div class="notification-header">
                <h3>Benachrichtigungen</h3>
                <button onclick="notificationManager.markAllAsRead()">Alle als gelesen markieren</button>
                <button class="close-panel" onclick="this.parentElement.parentElement.style.display='none'">×</button>
            </div>
            <div class="notification-list" id="notification-list">
                ${this.renderNotificationList()}
            </div>
        `;
        
        return panel;
    }

    renderNotificationList() {
        const notifications = this.getNotifications();
        
        if (notifications.length === 0) {
            return '<p class="no-notifications">Keine Benachrichtigungen</p>';
        }

        return notifications.map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}" onclick="notificationManager.handleNotificationClick(${JSON.stringify(notification).replace(/"/g, '&quot;')})">
                <div class="notification-content">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                    <small>${this.formatDate(notification.createdAt)}</small>
                </div>
                ${!notification.read ? '<div class="unread-indicator"></div>' : ''}
            </div>
        `).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
            return 'Gerade eben';
        } else if (diffInHours < 24) {
            return `Vor ${diffInHours} Stunden`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `Vor ${diffInDays} Tagen`;
        }
    }
}

const notificationManager = new NotificationManager();
