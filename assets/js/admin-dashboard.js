"use strict";

function loadAdminDashboard() {
    refreshAnalytics();
}

function refreshAnalytics() {
    const overview = analyticsManager.getAnalyticsOverview();
    const lessonAnalytics = analyticsManager.getLessonAnalytics();
    const quizAnalytics = analyticsManager.getQuizAnalytics();
    
    updateOverviewStats(overview);
    updateLessonAnalytics(lessonAnalytics);
    updateQuizAnalytics(quizAnalytics);
    updateTimeSeriesChart();
}

function updateOverviewStats(overview) {
    document.getElementById('total-events').textContent = overview.totalEvents;
    document.getElementById('unique-sessions').textContent = overview.uniqueSessions;
    document.getElementById('page-views').textContent = overview.pageViews;
    document.getElementById('lesson-completion-rate').textContent = overview.lessonCompletionRate + '%';
}

function updateLessonAnalytics(lessonAnalytics) {
    const tbody = document.getElementById('lesson-analytics-body');
    
    if (lessonAnalytics.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Keine Lektionsdaten verfügbar</td></tr>';
        return;
    }
    
    tbody.innerHTML = lessonAnalytics.map(lesson => `
        <tr>
            <td>${lesson.lessonTitle}</td>
            <td>${lesson.islandName}</td>
            <td>${lesson.starts}</td>
            <td>${lesson.completes}</td>
            <td>${lesson.completionRate}%</td>
            <td>${formatDuration(lesson.averageDuration)}</td>
        </tr>
    `).join('');
}

function updateQuizAnalytics(quizAnalytics) {
    const tbody = document.getElementById('quiz-analytics-body');
    
    if (quizAnalytics.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Keine Quizdaten verfügbar</td></tr>';
        return;
    }
    
    tbody.innerHTML = quizAnalytics.map(quiz => `
        <tr>
            <td>${quiz.quizTitle}</td>
            <td>${quiz.starts}</td>
            <td>${quiz.completes}</td>
            <td>${quiz.averageScore}%</td>
            <td>${quiz.passRate}%</td>
            <td>${formatDuration(quiz.averageDuration)}</td>
        </tr>
    `).join('');
}

function updateTimeSeriesChart() {
    const canvas = document.getElementById('analytics-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const pageViewsData = analyticsManager.getTimeSeriesData('page_view', 7);
    const lessonStartsData = analyticsManager.getTimeSeriesData('lesson_start', 7);
    
    simpleChart(ctx, {
        labels: pageViewsData.map(d => formatDate(d.date)),
        datasets: [
            {
                label: 'Seitenaufrufe',
                data: pageViewsData.map(d => d.count),
                color: '#2563eb'
            },
            {
                label: 'Lektionsstarts',
                data: lessonStartsData.map(d => d.count),
                color: '#10b981'
            }
        ]
    });
}

function simpleChart(ctx, data) {
    const canvas = ctx.canvas;
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    const padding = 40;
    
    ctx.clearRect(0, 0, width, height);
    
    const maxValue = Math.max(...data.datasets.flatMap(d => d.data));
    const xStep = (width - 2 * padding) / (data.labels.length - 1);
    const yScale = (height - 2 * padding) / maxValue;
    
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (height - 2 * padding) * (i / 5);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    data.datasets.forEach((dataset, datasetIndex) => {
        ctx.strokeStyle = dataset.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        dataset.data.forEach((value, index) => {
            const x = padding + index * xStep;
            const y = height - padding - (value * yScale);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            ctx.fillStyle = dataset.color;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        ctx.stroke();
    });
    
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    
    data.labels.forEach((label, index) => {
        if (index % Math.ceil(data.labels.length / 7) === 0) {
            const x = padding + index * xStep;
            ctx.fillText(label, x, height - 10);
        }
    });
    
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const value = Math.round(maxValue * (1 - i / 5));
        const y = padding + (height - 2 * padding) * (i / 5);
        ctx.fillText(value.toString(), padding - 10, y + 4);
    }
    
    const legendY = 20;
    data.datasets.forEach((dataset, index) => {
        const legendX = width - 150 + index * 80;
        
        ctx.fillStyle = dataset.color;
        ctx.fillRect(legendX, legendY, 15, 15);
        
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'left';
        ctx.fillText(dataset.label, legendX + 20, legendY + 12);
    });
}

function formatDuration(seconds) {
    if (!seconds) return '0 Min';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
        return remainingSeconds > 0 ? `${minutes} Min ${remainingSeconds} Sek` : `${minutes} Min`;
    }
    return `${remainingSeconds} Sek`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.hash === '#admin') {
        loadAdminDashboard();
    }
});
