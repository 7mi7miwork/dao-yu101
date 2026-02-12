"use strict";

function init() {
    console.log("Dao-Yu-101 initialized");
    loadComponent('components/navbar.html', 'navbar-container');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
