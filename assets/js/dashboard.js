"use strict";

function loadDashboard() {
    loadCourseStructure()
        .then(courseData => {
            displayOverallProgress(courseData);
            displayIslands(courseData);
        })
        .catch(error => {
            console.error('Failed to load dashboard:', error);
        });
}

function loadCourseStructure() {
    return fetch('data/course-structure.json')
        .then(response => response.json());
}

function displayOverallProgress(courseData) {
    const overallProgress = progressManager.getOverallProgress();
    const completedLessons = progressManager.getCompletedLessons();
    const totalLessons = courseData.course.islands.reduce((total, island) => {
        return total + island.lessons.length;
    }, 0);

    document.getElementById('overall-progress-fill').style.width = `${overallProgress}%`;
    document.getElementById('completed-lessons').textContent = completedLessons;
    document.getElementById('total-lessons-count').textContent = totalLessons;
    document.getElementById('overall-percentage').textContent = `${overallProgress}%`;
}

function displayIslands(courseData) {
    const islandsContainer = document.getElementById('islands-grid');
    islandsContainer.innerHTML = '';

    courseData.course.islands.forEach(island => {
        const islandProgress = progressManager.getIslandProgress(island.id);
        const calculatedProgress = progressManager.calculateIslandProgress(
            island.id, 
            island.lessons.map(lesson => lesson.id)
        );

        const islandCard = createIslandCard(island, calculatedProgress);
        islandsContainer.appendChild(islandCard);
    });
}

function createIslandCard(island, progress) {
    const card = document.createElement('div');
    card.className = 'island-card';
    
    const header = document.createElement('div');
    header.className = 'island-header';
    header.innerHTML = `
        <h3 class="island-title">${island.name}</h3>
        <p class="island-description">${island.description}</p>
    `;
    
    const progressSection = document.createElement('div');
    progressSection.className = 'island-progress';
    progressSection.innerHTML = `
        <div class="progress-info">
            <span class="progress-percentage">${progress.progress}%</span>
            <span class="progress-status">${progress.completed ? 'Abgeschlossen' : 'In Bearbeitung'}</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress.progress}%"></div>
        </div>
    `;
    
    const lessonsSection = document.createElement('div');
    lessonsSection.className = 'island-lessons';
    lessonsSection.innerHTML = `
        <h4>Lektionen (${progress.completedLessons || 0}/${island.lessons.length})</h4>
        <ul class="lesson-list">
            ${island.lessons.map(lesson => createLessonItem(lesson)).join('')}
        </ul>
    `;
    
    card.appendChild(header);
    card.appendChild(progressSection);
    card.appendChild(lessonsSection);
    
    return card;
}

function createLessonItem(lesson) {
    const lessonProgress = progressManager.getLessonProgress(lesson.id);
    const isCompleted = lessonProgress.completed;
    
    return `
        <li class="lesson-item">
            <div class="lesson-checkbox ${isCompleted ? 'completed' : ''}"></div>
            <div class="lesson-info">
                <div class="lesson-title">${lesson.title}</div>
                <div class="lesson-duration">${lesson.duration} Min</div>
            </div>
        </li>
    `;
}

function openLesson(lessonId, lessonType) {
    if (lessonType === 'quiz') {
        window.location.hash = '#quiz';
        loadComponent('pages/quiz.html', 'page-container')
            .then(() => {
                setTimeout(() => initializeQuiz('sample-quiz'), 100);
            });
    } else {
        window.location.hash = '#lesson';
        loadComponent('pages/lesson.html', 'page-container');
    }
    
    progressManager.updateLessonProgress(lessonId, {
        lastAccessed: new Date().toISOString()
    });
}

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.hash === '#dashboard' || !window.location.hash) {
        loadDashboard();
    }
});
