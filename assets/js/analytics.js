"use strict";

class AnalyticsManager {
    constructor() {
        this.events = [];
        this.sessionStart = new Date().toISOString();
        this.loadEvents();
        this.trackSessionStart();
    }

    loadEvents() {
        const stored = localStorage.getItem('analyticsEvents');
        if (stored) {
            this.events = JSON.parse(stored);
        }
    }

    saveEvents() {
        localStorage.setItem('analyticsEvents', JSON.stringify(this.events));
    }

    trackEvent(eventName, properties = {}) {
        const event = {
            id: Date.now().toString(),
            name: eventName,
            properties: {
                ...properties,
                timestamp: new Date().toISOString(),
                sessionId: this.getSessionId(),
                userAgent: navigator.userAgent,
                url: window.location.href
            }
        };

        this.events.push(event);
        this.saveEvents();
        
        console.log('Analytics Event:', event);
        return event;
    }

    trackPageView(pageName) {
        return this.trackEvent('page_view', {
            page: pageName,
            title: document.title
        });
    }

    trackLessonStart(lessonId, lessonTitle, islandName) {
        return this.trackEvent('lesson_start', {
            lessonId,
            lessonTitle,
            islandName
        });
    }

    trackLessonComplete(lessonId, lessonTitle, islandName, duration) {
        return this.trackEvent('lesson_complete', {
            lessonId,
            lessonTitle,
            islandName,
            duration
        });
    }

    trackQuizStart(quizId, quizTitle) {
        return this.trackEvent('quiz_start', {
            quizId,
            quizTitle
        });
    }

    trackQuizComplete(quizId, quizTitle, score, totalQuestions, duration) {
        return this.trackEvent('quiz_complete', {
            quizId,
            quizTitle,
            score,
            totalQuestions,
            duration,
            passed: score >= 70
        });
    }

    trackSearch(query, resultCount) {
        return this.trackEvent('search', {
            query,
            resultCount
        });
    }

    trackSessionStart() {
        return this.trackEvent('session_start', {
            startTime: this.sessionStart
        });
    }

    trackSessionEnd() {
        const sessionDuration = new Date() - new Date(this.sessionStart);
        return this.trackEvent('session_end', {
            startTime: this.sessionStart,
            endTime: new Date().toISOString(),
            duration: Math.round(sessionDuration / 1000)
        });
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    }

    getEvents(eventName = null, startDate = null, endDate = null) {
        let filteredEvents = this.events;

        if (eventName) {
            filteredEvents = filteredEvents.filter(event => event.name === eventName);
        }

        if (startDate) {
            filteredEvents = filteredEvents.filter(event => 
                new Date(event.properties.timestamp) >= new Date(startDate)
            );
        }

        if (endDate) {
            filteredEvents = filteredEvents.filter(event => 
                new Date(event.properties.timestamp) <= new Date(endDate)
            );
        }

        return filteredEvents;
    }

    getAnalyticsOverview() {
        const totalEvents = this.events.length;
        const uniqueSessions = new Set(this.events.map(e => e.properties.sessionId)).size;
        const pageViews = this.getEvents('page_view').length;
        const lessonStarts = this.getEvents('lesson_start').length;
        const lessonCompletes = this.getEvents('lesson_complete').length;
        const quizStarts = this.getEvents('quiz_start').length;
        const quizCompletes = this.getEvents('quiz_complete').length;

        return {
            totalEvents,
            uniqueSessions,
            pageViews,
            lessonStarts,
            lessonCompletes,
            quizStarts,
            quizCompletes,
            lessonCompletionRate: lessonStarts > 0 ? Math.round((lessonCompletes / lessonStarts) * 100) : 0,
            quizCompletionRate: quizStarts > 0 ? Math.round((quizCompletes / quizStarts) * 100) : 0
        };
    }

    getLessonAnalytics() {
        const lessonStarts = this.getEvents('lesson_start');
        const lessonCompletes = this.getEvents('lesson_complete');
        
        const lessonStats = {};

        lessonStarts.forEach(start => {
            const lessonId = start.properties.lessonId;
            if (!lessonStats[lessonId]) {
                lessonStats[lessonId] = {
                    lessonId: lessonId,
                    lessonTitle: start.properties.lessonTitle,
                    islandName: start.properties.islandName,
                    starts: 0,
                    completes: 0,
                    averageDuration: 0,
                    completionRate: 0
                };
            }
            lessonStats[lessonId].starts++;
        });

        lessonCompletes.forEach(complete => {
            const lessonId = complete.properties.lessonId;
            if (lessonStats[lessonId]) {
                lessonStats[lessonId].completes++;
                lessonStats[lessonId].averageDuration += complete.properties.duration || 0;
            }
        });

        Object.keys(lessonStats).forEach(lessonId => {
            const stats = lessonStats[lessonId];
            stats.completionRate = stats.starts > 0 ? Math.round((stats.completes / stats.starts) * 100) : 0;
            stats.averageDuration = stats.completes > 0 ? Math.round(stats.averageDuration / stats.completes) : 0;
        });

        return Object.values(lessonStats);
    }

    getQuizAnalytics() {
        const quizStarts = this.getEvents('quiz_start');
        const quizCompletes = this.getEvents('quiz_complete');
        
        const quizStats = {};

        quizStarts.forEach(start => {
            const quizId = start.properties.quizId;
            if (!quizStats[quizId]) {
                quizStats[quizId] = {
                    quizId: quizId,
                    quizTitle: start.properties.quizTitle,
                    starts: 0,
                    completes: 0,
                    averageScore: 0,
                    passRate: 0,
                    averageDuration: 0
                };
            }
            quizStats[quizId].starts++;
        });

        quizCompletes.forEach(complete => {
            const quizId = complete.properties.quizId;
            if (quizStats[quizId]) {
                quizStats[quizId].completes++;
                quizStats[quizId].averageScore += complete.properties.score || 0;
                quizStats[quizId].averageDuration += complete.properties.duration || 0;
            }
        });

        Object.keys(quizStats).forEach(quizId => {
            const stats = quizStats[quizId];
            stats.completionRate = stats.starts > 0 ? Math.round((stats.completes / stats.starts) * 100) : 0;
            stats.averageScore = stats.completes > 0 ? Math.round(stats.averageScore / stats.completes) : 0;
            stats.passRate = stats.completes > 0 ? Math.round((quizCompletes.filter(q => q.properties.passed).length / stats.completes) * 100) : 0;
            stats.averageDuration = stats.completes > 0 ? Math.round(stats.averageDuration / stats.completes) : 0;
        });

        return Object.values(quizStats);
    }

    getTimeSeriesData(eventName, days = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        const events = this.getEvents(eventName, startDate.toISOString(), endDate.toISOString());
        const dailyData = {};

        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateKey = date.toISOString().split('T')[0];
            dailyData[dateKey] = 0;
        }

        events.forEach(event => {
            const dateKey = event.properties.timestamp.split('T')[0];
            if (dailyData.hasOwnProperty(dateKey)) {
                dailyData[dateKey]++;
            }
        });

        return Object.keys(dailyData).map(date => ({
            date,
            count: dailyData[date]
        }));
    }

    exportData() {
        const data = {
            overview: this.getAnalyticsOverview(),
            lessonAnalytics: this.getLessonAnalytics(),
            quizAnalytics: this.getQuizAnalytics(),
            timeSeries: {
                pageViews: this.getTimeSeriesData('page_view'),
                lessonStarts: this.getTimeSeriesData('lesson_start'),
                quizCompletes: this.getTimeSeriesData('quiz_complete')
            },
            rawEvents: this.events
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    clearData() {
        if (confirm('Are you sure you want to clear all analytics data?')) {
            this.events = [];
            this.saveEvents();
            console.log('Analytics data cleared');
        }
    }
}

const analyticsManager = new AnalyticsManager();

window.addEventListener('beforeunload', () => {
    analyticsManager.trackSessionEnd();
});

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.hash.replace('#', '') || 'dashboard';
    analyticsManager.trackPageView(currentPage);
});
