"use strict";

class ProgressManager {
    constructor() {
        this.userProgress = {};
        this.loadProgress();
    }

    loadProgress() {
        const stored = localStorage.getItem('userProgress');
        if (stored) {
            this.userProgress = JSON.parse(stored);
        }
    }

    saveProgress() {
        localStorage.setItem('userProgress', JSON.stringify(this.userProgress));
    }

    updateLessonProgress(lessonId, progress) {
        if (!this.userProgress.lessons) {
            this.userProgress.lessons = {};
        }
        this.userProgress.lessons[lessonId] = {
            ...this.userProgress.lessons[lessonId],
            ...progress,
            lastAccessed: new Date().toISOString()
        };
        this.saveProgress();
    }

    updateIslandProgress(islandId, progress) {
        if (!this.userProgress.islands) {
            this.userProgress.islands = {};
        }
        this.userProgress.islands[islandId] = {
            ...this.userProgress.islands[islandId],
            ...progress,
            lastAccessed: new Date().toISOString()
        };
        this.saveProgress();
    }

    getLessonProgress(lessonId) {
        return this.userProgress.lessons?.[lessonId] || { completed: false, progress: 0 };
    }

    getIslandProgress(islandId) {
        return this.userProgress.islands?.[islandId] || { completed: false, progress: 0 };
    }

    calculateIslandProgress(islandId, lessonIds) {
        let completedLessons = 0;
        let totalProgress = 0;

        lessonIds.forEach(lessonId => {
            const lessonProgress = this.getLessonProgress(lessonId);
            if (lessonProgress.completed) {
                completedLessons++;
            }
            totalProgress += lessonProgress.progress || 0;
        });

        const progressPercentage = Math.round(totalProgress / lessonIds.length);
        const completed = completedLessons === lessonIds.length;

        this.updateIslandProgress(islandId, {
            progress: progressPercentage,
            completed: completed,
            completedLessons: completedLessons,
            totalLessons: lessonIds.length
        });

        return { progress: progressPercentage, completed };
    }

    getOverallProgress() {
        const islands = Object.values(this.userProgress.islands || {});
        if (islands.length === 0) return 0;

        const totalProgress = islands.reduce((sum, island) => sum + (island.progress || 0), 0);
        return Math.round(totalProgress / islands.length);
    }

    getCompletedLessons() {
        const lessons = Object.values(this.userProgress.lessons || {});
        return lessons.filter(lesson => lesson.completed).length;
    }

    getTotalLessons() {
        return Object.keys(this.userProgress.lessons || {}).length;
    }

    markLessonComplete(lessonId) {
        this.updateLessonProgress(lessonId, {
            completed: true,
            progress: 100,
            completedAt: new Date().toISOString()
        });
    }

    markQuizComplete(lessonId, quizScore) {
        this.updateLessonProgress(lessonId, {
            quizCompleted: true,
            quizScore: quizScore,
            quizCompletedAt: new Date().toISOString()
        });
    }

    getAchievements() {
        const achievements = [];
        const completedLessons = this.getCompletedLessons();
        const overallProgress = this.getOverallProgress();

        if (completedLessons >= 1) {
            achievements.push({ id: 'first_lesson', name: 'Erste Lektion', description: 'Erste Lektion abgeschlossen' });
        }
        if (completedLessons >= 5) {
            achievements.push({ id: 'five_lessons', name: 'Lernanfänger', description: '5 Lektionen abgeschlossen' });
        }
        if (completedLessons >= 10) {
            achievements.push({ id: 'ten_lessons', name: 'Lernfortgeschrittener', description: '10 Lektionen abgeschlossen' });
        }
        if (overallProgress >= 50) {
            achievements.push({ id: 'half_way', name: 'Halbzeit', description: '50% des Kurses abgeschlossen' });
        }
        if (overallProgress >= 100) {
            achievements.push({ id: 'course_complete', name: 'Kurs abgeschlossen', description: 'Gesamten Kurs abgeschlossen' });
        }

        return achievements;
    }
}

const progressManager = new ProgressManager();
