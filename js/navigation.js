/**
 * Navigation Component
 * Shared navigation for all pages
 */

const NavigationManager = (function() {
    // Navigation items configuration
    const navItems = [
        { href: 'dashboard.html', label: 'Dashboard', icon: '📊', auth: true },
        { href: 'calculator.html', label: 'Calculator', icon: '🧮', auth: true },
        { href: 'comparison.html', label: 'Compare', icon: '⚖️', auth: true },
        { href: 'profile.html', label: 'Profile', icon: '👤', auth: true },
        { href: 'admin.html', label: 'Admin', icon: '🔧', auth: true, admin: true }
    ];

    /**
     * Generate navigation HTML based on auth state
     * @param {boolean} isLoggedIn - Whether user is logged in
     * @param {boolean} isAdmin - Whether user is admin
     * @returns {string} - HTML string
     */
    function generateNavHTML(isLoggedIn, isAdmin) {
        if (!isLoggedIn) {
            return '';
        }

        let navLinks = '';
        
        navItems.forEach(item => {
            // Skip if requires auth and not logged in
            if (item.auth && !isLoggedIn) return;
            
            // Skip admin items if not admin
            if (item.admin && !isAdmin) return;

            const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
            const isActive = currentPage === item.href;
            
            navLinks += `
                <a href="${item.href}" class="nav-link ${isActive ? 'active' : ''}">
                    <span class="nav-icon">${item.icon}</span>
                    <span class="nav-label">${item.label}</span>
                </a>
            `;
        });

        return navLinks;
    }

    /**
     * Generate auth section HTML
     * @param {object} user - Current user object
     * @returns {string} - HTML string
     */
    function generateAuthHTML(user) {
        if (user) {
            return `
                <div class="nav-user-info">
                    <span class="nav-user-email">${user.email}</span>
                    <button onclick="NavigationManager.logout()" class="btn btn-logout">Logout</button>
                </div>
            `;
        } else {
            return `
                <a href="login.html" class="btn btn-login">Login</a>
            `;
        }
    }

    /**
     * Render navigation to the page
     */
    function render() {
        try {
            const navContainer = document.getElementById('main-nav');
            if (!navContainer) return;

            const user = AuthManager.getCurrentUser();
            const isLoggedIn = AuthManager.isLoggedIn();
            const isAdmin = AuthManager.isAdmin();

            navContainer.innerHTML = `
                <nav class="navbar">
                    <div class="nav-brand">
                        <a href="dashboard.html">
                            <span class="brand-icon">💰</span>
                            <span class="brand-text">Smart EMI</span>
                        </a>
                    </div>
                    <div class="nav-links">
                        ${generateNavHTML(isLoggedIn, isAdmin)}
                    </div>
                    <div class="nav-auth" id="nav-auth">
                        ${generateAuthHTML(user)}
                    </div>
                    <button class="nav-toggle" onclick="NavigationManager.toggleMobile()" aria-label="Toggle navigation">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </nav>
            `;

            // Add mobile menu toggle listener
            this.setupMobileMenu();
        } catch (err) {
            console.error('Navigation render error:', err);
            // Don't throw - just log the error
        }
    }

    /**
     * Setup mobile menu toggle
     */
    function setupMobileMenu() {
        const toggle = document.querySelector('.nav-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (toggle && navLinks) {
            toggle.addEventListener('click', () => {
                navLinks.classList.toggle('mobile-open');
                toggle.classList.toggle('active');
            });
        }
    }

    /**
     * Toggle mobile menu
     */
    function toggleMobile() {
        const navLinks = document.querySelector('.nav-links');
        const toggle = document.querySelector('.nav-toggle');
        
        if (navLinks) {
            navLinks.classList.toggle('mobile-open');
        }
        if (toggle) {
            toggle.classList.toggle('active');
        }
    }

    /**
     * Logout and redirect
     */
    async function logout() {
        const result = await AuthManager.signOut();
        if (result.success) {
            window.location.href = 'login.html';
        } else {
            alert('Error logging out: ' + result.error);
        }
    }

    /**
     * Initialize navigation
     */
    function init() {
        // Render navigation
        this.render();

        // Listen for auth changes
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                this.render();
            }
        });
    }

    // Public API
    return {
        render: render,
        logout: logout,
        toggleMobile: toggleMobile,
        init: init
    };
})();

// Export for global use
window.NavigationManager = NavigationManager;
