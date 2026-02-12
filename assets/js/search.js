"use strict";

class SearchManager {
    constructor() {
        this.searchIndex = [];
        this.initializeSearch();
    }

    async initializeSearch() {
        try {
            const courseData = await this.loadCourseData();
            this.buildSearchIndex(courseData);
        } catch (error) {
            console.error('Failed to initialize search:', error);
        }
    }

    async loadCourseData() {
        const response = await fetch('data/course-structure.json');
        return await response.json();
    }

    buildSearchIndex(courseData) {
        this.searchIndex = [];

        courseData.course.islands.forEach(island => {
            this.searchIndex.push({
                id: island.id,
                title: island.name,
                description: island.description,
                type: 'island',
                islandName: island.name,
                url: '#dashboard'
            });

            island.lessons.forEach(lesson => {
                this.searchIndex.push({
                    id: lesson.id,
                    title: lesson.title,
                    description: lesson.description,
                    type: lesson.type,
                    islandName: island.name,
                    duration: lesson.duration,
                    quizId: lesson.quizId,
                    url: lesson.type === 'quiz' ? '#quiz' : '#lesson'
                });
            });
        });
    }

    search(query) {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const searchTerm = query.toLowerCase().trim();
        
        return this.searchIndex.filter(item => {
            return item.title.toLowerCase().includes(searchTerm) ||
                   item.description.toLowerCase().includes(searchTerm) ||
                   item.type.toLowerCase().includes(searchTerm) ||
                   item.islandName.toLowerCase().includes(searchTerm);
        }).sort((a, b) => {
            const aScore = this.calculateRelevanceScore(a, searchTerm);
            const bScore = this.calculateRelevanceScore(b, searchTerm);
            return bScore - aScore;
        });
    }

    calculateRelevanceScore(item, searchTerm) {
        let score = 0;
        
        if (item.title.toLowerCase().includes(searchTerm)) {
            score += 10;
        }
        
        if (item.description.toLowerCase().includes(searchTerm)) {
            score += 5;
        }
        
        if (item.type.toLowerCase().includes(searchTerm)) {
            score += 3;
        }
        
        if (item.islandName.toLowerCase().includes(searchTerm)) {
            score += 2;
        }
        
        if (item.title.toLowerCase() === searchTerm) {
            score += 20;
        }
        
        return score;
    }

    displaySearchResults(results) {
        const searchResultsContainer = document.getElementById('search-results');
        
        if (!searchResultsContainer) {
            const container = document.createElement('div');
            container.id = 'search-results';
            container.className = 'search-results';
            document.body.appendChild(container);
            return this.displaySearchResults(results);
        }

        if (results.length === 0) {
            searchResultsContainer.innerHTML = `
                <div class="search-result-item">
                    <p>Keine Ergebnisse gefunden</p>
                </div>
            `;
        } else {
            searchResultsContainer.innerHTML = results.map(result => `
                <div class="search-result-item" onclick="searchManager.handleSearchResultClick('${result.id}', '${result.type}', '${result.url}', '${result.quizId || ''}')">
                    <div class="search-result-title">${result.title}</div>
                    <div class="search-result-description">${result.description}</div>
                    <div class="search-result-meta">
                        <span class="search-result-type">${this.getTypeLabel(result.type)}</span>
                        <span class="search-result-island">🏝️ ${result.islandName}</span>
                        ${result.duration ? `<span class="search-result-duration">⏱️ ${result.duration} Min</span>` : ''}
                    </div>
                </div>
            `).join('');
        }

        searchResultsContainer.style.display = 'block';
    }

    getTypeLabel(type) {
        const labels = {
            'content': '📚 Inhalt',
            'exercise': '✏️ Übung',
            'quiz': '🧪 Quiz',
            'island': '🏝️ Insel'
        };
        return labels[type] || type;
    }

    handleSearchResultClick(id, type, url, quizId) {
        this.hideSearchResults();
        
        if (type === 'quiz' && quizId) {
            window.location.hash = '#quiz';
            loadComponent('pages/quiz.html', 'page-container')
                .then(() => {
                    setTimeout(() => initializeQuiz(quizId), 100);
                });
        } else if (type === 'island') {
            window.location.hash = '#dashboard';
            loadComponent('pages/dashboard.html', 'page-container');
        } else {
            window.location.hash = url;
            loadComponent('pages/lesson.html', 'page-container');
        }

        progressManager.updateLessonProgress(id, {
            lastAccessed: new Date().toISOString()
        });
    }

    hideSearchResults() {
        const searchResultsContainer = document.getElementById('search-results');
        if (searchResultsContainer) {
            searchResultsContainer.style.display = 'none';
        }
    }

    filterByType(type) {
        return this.searchIndex.filter(item => item.type === type);
    }

    filterByIsland(islandName) {
        return this.searchIndex.filter(item => 
            item.islandName.toLowerCase().includes(islandName.toLowerCase())
        );
    }

    getPopularItems() {
        return this.searchIndex.slice(0, 5);
    }

    getRecentItems() {
        const recentProgress = Object.entries(progressManager.userProgress.lessons || {})
            .filter(([id, progress]) => progress.lastAccessed)
            .sort((a, b) => new Date(b[1].lastAccessed) - new Date(a[1].lastAccessed))
            .slice(0, 5)
            .map(([id]) => this.searchIndex.find(item => item.id === id))
            .filter(Boolean);

        return recentProgress;
    }
}

const searchManager = new SearchManager();

function handleSearch(event) {
    const query = event.target.value;
    
    if (event.key === 'Enter') {
        performSearch();
    } else if (query.length >= 2) {
        const results = searchManager.search(query);
        searchManager.displaySearchResults(results);
    } else {
        searchManager.hideSearchResults();
    }
}

function performSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    
    if (query.length >= 2) {
        const results = searchManager.search(query);
        searchManager.displaySearchResults(results);
    }
}

function toggleNotifications() {
    const panel = document.getElementById('notification-panel');
    
    if (!panel) {
        const notificationPanel = notificationManager.createNotificationPanel();
        document.body.appendChild(notificationPanel);
        notificationPanel.style.display = 'block';
    } else {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
}

document.addEventListener('click', function(event) {
    const searchResults = document.getElementById('search-results');
    const searchContainer = document.querySelector('.search-container');
    const notificationPanel = document.getElementById('notification-panel');
    const notificationButton = document.getElementById('notification-button');
    
    if (searchResults && !searchContainer.contains(event.target)) {
        searchResults.style.display = 'none';
    }
    
    if (notificationPanel && !notificationPanel.contains(event.target) && !notificationButton.contains(event.target)) {
        notificationPanel.style.display = 'none';
    }
});
