# Step 03 — App Shell + Component Loader

## Overview
This step implements the foundational architecture for dynamic component loading in the Dao-Yu-101 application. The app shell pattern allows for efficient loading of UI components without full page refreshes.

## Architecture

### App Shell Structure
- **Header**: Static application title
- **Navbar Container**: Dynamically loaded navigation
- **Page Container**: Target for dynamic page content
- **Footer**: Static copyright information

### Component Loader
The `loadComponent()` function provides:
- HTML fetching from component files
- Dynamic injection into target containers
- Error handling and logging
- Status reporting for debugging

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

## Benefits
- Faster navigation between pages
- Reduced server load
- Better user experience
- Modular component architecture
- Easier maintenance and updates

## Next Steps
The component loader sets up the foundation for the router system to dynamically load pages based on URL routing.
