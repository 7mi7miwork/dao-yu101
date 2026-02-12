"use strict";

let currentQuestionIndex = 0;
let quizTimer = null;
let timeRemaining = 0;

function initializeQuiz(quizId) {
    quizManager.loadQuiz(quizId)
        .then(quiz => {
            if (quiz) {
                displayQuizInfo(quiz);
                displayQuestion(0);
                startTimer(quiz.timeLimit || 300);
            }
        })
        .catch(error => {
            console.error('Failed to initialize quiz:', error);
            document.getElementById('quiz-title').textContent = 'Fehler beim Laden des Quiz';
        });
}

function displayQuizInfo(quiz) {
    document.getElementById('quiz-title').textContent = quiz.title;
    document.getElementById('quiz-description').textContent = quiz.description;
}

function displayQuestion(index) {
    const quiz = quizManager.currentQuiz;
    if (!quiz || index >= quiz.questions.length) return;

    const question = quiz.questions[index];
    currentQuestionIndex = index;

    document.getElementById('question-text').textContent = question.question;
    
    const optionsContainer = document.getElementById('answer-options');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, optionIndex) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'answer-option';
        optionElement.onclick = () => selectAnswer(optionIndex);
        
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `question-${question.id}`;
        input.value = option;
        input.id = `option-${optionIndex}`;
        
        const label = document.createElement('label');
        label.htmlFor = `option-${optionIndex}`;
        label.textContent = option;
        
        optionElement.appendChild(input);
        optionElement.appendChild(label);
        optionsContainer.appendChild(optionElement);
    });

    updateProgress();
    updateNavigationButtons();
}

function selectAnswer(optionIndex) {
    const quiz = quizManager.currentQuiz;
    const question = quiz.questions[currentQuestionIndex];
    const selectedOption = question.options[optionIndex];
    
    quizManager.submitAnswer(question.id, selectedOption);
    
    document.querySelectorAll('.answer-option').forEach((option, index) => {
        option.classList.toggle('selected', index === optionIndex);
        option.querySelector('input').checked = index === optionIndex;
    });
}

function updateProgress() {
    const quiz = quizManager.currentQuiz;
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
    
    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('progress-text').textContent = `${Math.round(progress)}%`;
}

function updateNavigationButtons() {
    const quiz = quizManager.currentQuiz;
    const prevButton = document.getElementById('prev-question');
    const nextButton = document.getElementById('next-question');
    const submitButton = document.getElementById('submit-quiz');
    
    prevButton.disabled = currentQuestionIndex === 0;
    
    if (currentQuestionIndex === quiz.questions.length - 1) {
        nextButton.style.display = 'none';
        submitButton.style.display = 'block';
    } else {
        nextButton.style.display = 'block';
        submitButton.style.display = 'none';
    }
}

function nextQuestion() {
    const quiz = quizManager.currentQuiz;
    if (currentQuestionIndex < quiz.questions.length - 1) {
        displayQuestion(currentQuestionIndex + 1);
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        displayQuestion(currentQuestionIndex - 1);
    }
}

function submitQuiz() {
    clearInterval(quizTimer);
    
    const result = quizManager.completeQuiz();
    displayResults(result);
}

function displayResults(result) {
    document.getElementById('question-container').style.display = 'none';
    document.getElementById('quiz-progress').style.display = 'none';
    document.getElementById('quiz-results').style.display = 'block';
    
    document.getElementById('final-score').textContent = `${result.score}%`;
    document.getElementById('correct-answers').textContent = 
        Math.round((result.score / 100) * result.totalQuestions);
    document.getElementById('total-questions').textContent = result.totalQuestions;
    
    let message = '';
    if (result.score >= 90) {
        message = 'Ausgezeichnet! Du hast das Quiz bestanden.';
    } else if (result.score >= 70) {
        message = 'Gut gemacht! Du hast das Quiz bestanden.';
    } else if (result.score >= 50) {
        message = 'Nicht schlecht, aber da geht noch mehr.';
    } else {
        message = 'Versuche es noch einmal, du schaffst das!';
    }
    
    document.getElementById('result-message').textContent = message;
}

function restartQuiz() {
    document.getElementById('quiz-results').style.display = 'none';
    document.getElementById('question-container').style.display = 'block';
    document.getElementById('quiz-progress').style.display = 'block';
    
    currentQuestionIndex = 0;
    timeRemaining = 0;
    
    if (quizManager.currentQuiz) {
        initializeQuiz(quizManager.currentQuiz.id);
    }
}

function backToDashboard() {
    window.location.hash = '#dashboard';
    loadComponent('pages/dashboard.html', 'page-container');
}

function startTimer(seconds) {
    timeRemaining = seconds;
    quizTimer = setInterval(() => {
        timeRemaining--;
        
        if (timeRemaining <= 0) {
            clearInterval(quizTimer);
            submitQuiz();
        }
    }, 1000);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
