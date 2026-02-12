# Step 03 — App Shell + Component Loader (Visible Version)

## Overview
This step implements the foundational architecture for dynamic component loading in the Dao-Yu-101 application with visible, functional page content. The app shell pattern allows for efficient loading of UI components without full page refreshes.

## Architecture

### App Shell Structure
- **Header**: Static application title
- **Navbar Container**: Dynamically loaded navigation with functional links
- **Page Container**: Target for dynamic page content
- **Footer**: Static copyright information

### Component Loader
The `loadComponent()` function provides:
- HTML fetching from component files
- Dynamic injection into target containers
- Error handling and logging
- Status reporting for debugging

### Navigation System
- Navbar links use `loadComponent()` to load pages dynamically
- Dashboard and Lesson pages are fully functional
- Click handlers load content into page-container

## Files Modified

### index.html
- Added `page-container` div for dynamic content
- Updated script loading order: main.js → loader.js → router.js

### assets/js/main.js
- Enhanced `init()` function to automatically load navbar
- Maintains initialization logging

### assets/js/loader.js (New)
- Core component loading functionality
- Error handling for missing targets and network issues
- Console logging for load status

### components/navbar.html (Updated)
- Navigation links now use `loadComponent()` function
- Links target dashboard.html and lesson.html pages

### pages/dashboard.html (Converted)
- Simplified to component fragment (no HTML structure)
- Contains dashboard heading and welcome message

### pages/lesson.html (Converted)
- Simplified to component fragment (no HTML structure)
- Contains lesson heading and description

## Benefits
- Faster navigation between pages
- Reduced server load
- Better user experience with visible content
- Modular component architecture
- Easier maintenance and updates
- Functional navigation without page refreshes

## Next Steps
The component loader and visible pages set up the foundation for the router system to dynamically load pages based on URL routing with proper state management.
