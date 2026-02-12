'use strict';

function loadPage(pageName) {
    console.log(`Navigating to: ${pageName}`);
    
    // Basic router logic placeholder
    switch(pageName) {
        case 'dashboard':
            console.log('Loading dashboard page');
            break;
        case 'lesson':
            console.log('Loading lesson page');
            break;
        default:
            console.log('Unknown page:', pageName);
    }
}

// Initialize router
document.addEventListener('DOMContentLoaded', function() {
    console.log('Router initialized');
});
