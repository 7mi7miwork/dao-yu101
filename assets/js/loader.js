"use strict";

function loadComponent(path, targetElementId) {
    const targetElement = document.getElementById(targetElementId);
    
    if (!targetElement) {
        console.error(`Target element with id '${targetElementId}' not found`);
        return;
    }
    
    fetch(path)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            targetElement.innerHTML = html;
            console.log(`Component loaded: ${path} -> ${targetElementId}`);
        })
        .catch(error => {
            console.error(`Failed to load component ${path}:`, error);
            targetElement.innerHTML = `<p>Error loading component: ${path}</p>`;
        });
}
