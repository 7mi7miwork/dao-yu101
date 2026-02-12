# Step 03 — Technical Architecture Summary (Visible Version)

## Component Loading System

### Core Function: loadComponent(path, targetElementId)
```javascript
// Fetches HTML and injects into DOM
// Parameters: component path, target element ID
// Returns: void (with console logging)
```

### Load Order Dependencies
1. **main.js** - DOM ready, initialization
2. **loader.js** - Component loading utilities
3. **router.js** - URL routing (uses loader)

### DOM Structure
```
<body>
  <header>...</header>
  <div id="navbar-container"></div>  <!-- Dynamic navbar -->
  <div id="page-container"></div>     <!-- Dynamic pages -->
  <footer>...</footer>
</body>
```

### Navigation Implementation
- Navbar links use onclick="loadComponent('pages/*.html', 'page-container')"
- Dashboard: loads pages/dashboard.html
- Lesson: loads pages/lesson.html
- No page refresh, dynamic content injection

### Page Components
- **dashboard.html**: `<h1>Dashboard</h1><p>Welcome to your Dashboard!</p>`
- **lesson.html**: `<h1>Lesson Page</h1><p>Here you can see lessons.</p>`
- Components are fragments (no HTML structure)

### Error Handling
- Target element validation
- HTTP response status checking
- Console error logging
- Fallback error messages in UI

### Initialization Flow
1. DOMContentLoaded event fires
2. main.js init() executes
3. loadComponent() fetches navbar.html
4. Navbar injected into navbar-container
5. Console logs success/failure status
6. Navigation links become functional

## Technical Specifications
- Uses modern fetch API
- Strict mode JavaScript
- Async component loading
- Modular file structure
- No external dependencies
- Component fragments (not full HTML pages)
- Event-driven navigation
