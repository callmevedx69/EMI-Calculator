/**
 * Theme Manager
 * Handles dark mode toggle and persistence across all pages
 */

const ThemeManager = (function() {
    const THEME_KEY = 'theme';
    let isDarkMode = false;

    /**
     * Initialize theme on page load
     */
    function init() {
        loadTheme();
        setupEventListeners();
    }

    /**
     * Load theme from localStorage and apply
     */
    function loadTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme === 'dark') {
            isDarkMode = true;
            applyTheme();
        }
    }

    /**
     * Apply theme to the page
     */
    function applyTheme() {
        const themeToggle = document.getElementById('themeToggle');
        
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            document.documentElement.setAttribute('data-theme', 'dark');
            if (themeToggle) {
                themeToggle.textContent = '☀️';
            }
        } else {
            document.body.classList.remove('dark-mode');
            document.documentElement.removeAttribute('data-theme');
            if (themeToggle) {
                themeToggle.textContent = '🌙';
            }
        }
    }

    /**
     * Toggle theme
     */
    function toggleTheme() {
        isDarkMode = !isDarkMode;
        applyTheme();
        saveTheme();
    }

    /**
     * Save theme to localStorage
     */
    function saveTheme() {
        localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
    }

    /**
     * Setup event listeners for theme toggle
     */
    function setupEventListeners() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    return {
        toggleTheme: toggleTheme,
        isDarkMode: function() { return isDarkMode; }
    };
})();
