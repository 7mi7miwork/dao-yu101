"use strict";

class QuizManager {
    constructor() {
        this.currentQuiz = null;
        this.userAnswers = {};
        this.quizResults = [];
        this.loadQuizResults();
    }

    loadQuizResults() {
        const stored = localStorage.getItem('quizResults');
        if (stored) {
            this.quizResults = JSON.parse(stored);
        }
    }

    saveQuizResults() {
        localStorage.setItem('quizResults', JSON.stringify(this.quizResults));
    }

    loadQuiz(quizId) {
        return fetch(`data/quizzes/${quizId}.json`)
            .then(response => response.json())
            .then(quiz => {
                this.currentQuiz = quiz;
                this.userAnswers = {};
                return quiz;
            })
            .catch(error => {
                console.error('Failed to load quiz:', error);
                return null;
            });
    }

    submitAnswer(questionId, answer) {
        this.userAnswers[questionId] = answer;
    }

    calculateScore() {
        if (!this.currentQuiz) return 0;
        
        let correct = 0;
        this.currentQuiz.questions.forEach(question => {
            if (this.userAnswers[question.id] === question.correctAnswer) {
                correct++;
            }
        });
        
        return Math.round((correct / this.currentQuiz.questions.length) * 100);
    }

    completeQuiz() {
        if (!this.currentQuiz) return null;
        
        const result = {
            quizId: this.currentQuiz.id,
            score: this.calculateScore(),
            totalQuestions: this.currentQuiz.questions.length,
            completedAt: new Date().toISOString(),
            answers: { ...this.userAnswers }
        };
        
        this.quizResults.push(result);
        this.saveQuizResults();
        
        return result;
    }

    getQuizProgress(quizId) {
        const results = this.quizResults.filter(r => r.quizId === quizId);
        return results.length > 0 ? results[results.length - 1] : null;
    }

    getAllResults() {
        return this.quizResults;
    }

    getAverageScore() {
        if (this.quizResults.length === 0) return 0;
        const total = this.quizResults.reduce((sum, result) => sum + result.score, 0);
        return Math.round(total / this.quizResults.length);
    }
}

const quizManager = new QuizManager();
