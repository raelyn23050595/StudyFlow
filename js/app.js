/**
 * StudyFlow - Main Application JavaScript
 * Features:
 * - Smooth scroll animations with Intersection Observer
 * - Dynamic agent card interactions
 * - Form validation and email signup
 * - Modal management for agent details
 * - Mobile menu toggle
 * - LocalStorage for user preferences
 * - Performance optimized with lazy loading and event delegation
 */

// ============================================
// Application State
// ============================================

const AppState = {
    userEmail: localStorage.getItem('studyflow_email') || '',
    agentDetails: {
        rag: {
            title: 'RAG Agent - Smart Resource Retrieval',
            description: 'The RAG (Retrieval-Augmented Generation) Agent is your personal research assistant. It instantly retrieves your module guides, exam formats, and timetables, so you always have the right information at your fingertips. No more digging through documents!'
        },
        planner: {
            title: 'Planner Agent - Personalized Study Scheduling',
            description: 'The Planner Agent creates customized study schedules based on your deadlines, learning pace, and goals. It intelligently distributes your workload and adapts as you progress through your modules.'
        },
        explainer: {
            title: 'Explainer Agent - Concept Simplification',
            description: 'Struggle with complex topics? The Explainer Agent breaks down difficult concepts into digestible summaries, provides real-world examples, and offers study tips tailored to different learning styles.'
        }
    }
};

// ============================================
// DOM Utility Functions
// ============================================

const DOM = {
    /**
     * Safely query single element
     */
    query: (selector) => document.querySelector(selector),

    /**
     * Safely query all elements
     */
    queryAll: (selector) => document.querySelectorAll(selector),

    /**
     * Create element with class
     */
    create: (tag, className = '') => {
        const el = document.createElement(tag);
        if (className) el.className = className;
        return el;
    },

    /**
     * Add event listener with event delegation
     */
    on: (element, event, selector, handler) => {
        element.addEventListener(event, (e) => {
            const target = e.target.closest(selector);
            if (target) handler.call(target, e);
        });
    },

    /**
     * Toggle class
     */
    toggleClass: (el, className) => {
        el?.classList.toggle(className);
    },

    /**
     * Add class
     */
    addClass: (el, className) => {
        el?.classList.add(className);
    },

    /**
     * Remove class
     */
    removeClass: (el, className) => {
        el?.classList.remove(className);
    }
};

// ============================================
// Intersection Observer for Animations
// ============================================

class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    DOM.addClass(entry.target, 'in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        // Observe all cards and sections
        DOM.queryAll('.problem-card, .agent-card, .feature-item, section').forEach(el => {
            observer.observe(el);
        });
    }
}

// ============================================
// Navigation Management
// ============================================

class Navigation {
    constructor() {
        this.mobileMenuBtn = DOM.query('.mobile-menu-btn');
        this.navLinks = DOM.query('.nav-links');
        this.init();
    }

    init() {
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Close menu when link clicked
        DOM.queryAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => this.closeMobileMenu());
        });

        // Smooth scroll for anchor links
        this.setupSmoothScroll();
    }

    toggleMobileMenu() {
        const isExpanded = this.mobileMenuBtn.getAttribute('aria-expanded') === 'true';
        this.mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
        DOM.toggleClass(this.navLinks, 'active');
    }

    closeMobileMenu() {
        this.mobileMenuBtn?.setAttribute('aria-expanded', 'false');
        DOM.removeClass(this.navLinks, 'active');
    }

    setupSmoothScroll() {
        DOM.queryAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                const target = DOM.query(href);
                if (target) {
                    e.preventDefault();
                    // Extra smooth scroll with offset for navbar
                    const offset = 80;
                    const targetPosition = target.offsetTop - offset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// ============================================
// Agent Cards Management
// ============================================

class AgentCards {
    constructor() {
        this.agentCards = DOM.queryAll('.agent-card');
        this.modal = DOM.query('#agent-modal');
        this.init();
    }

    init() {
        // Event delegation for learning more
        DOM.on(document, 'click', '.btn-learn-more', (e) => {
            const agentType = e.target.closest('.agent-card').dataset.agent;
            this.showModal(agentType);
        });

        // Close modal functionality
        const closeBtn = DOM.query('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Close modal on outside click
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    showModal(agentType) {
        const agent = AppState.agentDetails[agentType];
        if (!agent) return;

        DOM.query('#modal-title').textContent = agent.title;
        DOM.query('#modal-description').textContent = agent.description;
        DOM.addClass(this.modal, 'active');
        this.modal?.setAttribute('aria-hidden', 'false');

        // Focus management for accessibility
        this.modal?.focus();
    }

    closeModal() {
        DOM.removeClass(this.modal, 'active');
        this.modal?.setAttribute('aria-hidden', 'true');
    }
}

// ============================================
// Form Management
// ============================================

class SignupForm {
    constructor() {
        this.form = DOM.query('#signup-form');
        this.messageEl = DOM.query('#form-message');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    handleSubmit(e) {
        e.preventDefault();

        const emailInput = this.form.querySelector('input[type="email"]');
        const email = emailInput.value.trim();

        // Validate email
        if (!this.isValidEmail(email)) {
            this.showMessage('Please enter a valid email address', 'error');
            return;
        }

        // Save to localStorage
        localStorage.setItem('studyflow_email', email);
        AppState.userEmail = email;

        // Show success message
        this.showMessage('✓ Check your email to get started!', 'success');

        // Reset form
        this.form.reset();

        // Log for demo purposes (in real app, send to server)
        console.log('Email signup:', email);

        // Clear message after 5 seconds
        setTimeout(() => this.clearMessage(), 5000);
    }

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    showMessage(text, type) {
        this.messageEl.textContent = text;
        this.messageEl.className = type;
    }

    clearMessage() {
        this.messageEl.textContent = '';
        this.messageEl.className = '';
    }
}

// ============================================
// Performance Monitoring
// ============================================

class PerformanceMonitor {
    init() {
        if (window.performance && window.performance.timing) {
            window.addEventListener('load', () => {
                this.logMetrics();
            });
        }
    }

    logMetrics() {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
    }
}

// ============================================
// Lazy Loading Images (if added)
// ============================================

class LazyLoader {
    init() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });

            DOM.queryAll('img[data-src]').forEach(img => imageObserver.observe(img));
        }
    }
}

// ============================================
// Theme Manager
// ============================================

class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('studyflow_theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('studyflow_theme', theme);
    }
}

// ============================================
// Application Initialization
// ============================================

class StudyFlowApp {
    init() {
        console.log('🎓 StudyFlow App Initializing...');

        // Initialize all modules
        new Navigation();
        new AgentCards();
        new SignupForm();
        new ScrollAnimations();
        new LazyLoader();
        new ThemeManager();
        new PerformanceMonitor();

        // Add CSS for animations
        this.injectAnimationStyles();

        console.log('✅ StudyFlow App Ready!');
    }

    injectAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .agent-card,
            .problem-card,
            .feature-item,
            section {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.6s ease-out, transform 0.6s ease-out;
            }

            .agent-card.in-view,
            .problem-card.in-view,
            .feature-item.in-view,
            section.in-view {
                opacity: 1;
                transform: translateY(0);
            }

            @media (prefers-reduced-motion: reduce) {
                .agent-card,
                .problem-card,
                .feature-item,
                section {
                    opacity: 1;
                    transform: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ============================================
// Start Application
// ============================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new StudyFlowApp().init();
    });
} else {
    // DOM is already ready
    new StudyFlowApp().init();
}

// Export for testing (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StudyFlowApp, DOM, AppState };
}
