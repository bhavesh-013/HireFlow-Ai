/**
 * HireFlow AI — Main Application Controller
 * Part 1
 */

// ===============================
// Toast Notification Helper
// ===============================
const Toast = {
  show(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let icon = "fa-info-circle";

    if (type === "success") icon = "fa-circle-check";
    if (type === "warning") icon = "fa-triangle-exclamation";
    if (type === "error") icon = "fa-circle-xmark";

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";

      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

// ===============================
// Main Application
// ===============================
const App = {

  init() {

    console.log("🚀 Initializing HireFlow AI...");

    const theme = Store.getState().theme || "light";

    document.documentElement.setAttribute("data-theme", theme);

    this.renderView(Store.getState().activeView);

    this.renderCoachDrawer();

    Store.subscribe((state) => {
      this.renderView(state.activeView);
    });

    this.bindGlobalEvents();

  },

  // ===============================
  // Render Views
  // ===============================
  renderView(viewName) {

    const root = document.getElementById("app-root");

    const landingHeader = document.querySelector("header.navbar");

    const topBanner = document.getElementById("top-preview-banner");

    if (!root) return;

    // ===========================================
    // Workspace
    // ===========================================

    if (viewName === "workspace") {

      if (landingHeader) landingHeader.style.display = "none";
      if (topBanner) topBanner.style.display = "none";

      const state = Store.getState();

      const subView = state.activeWorkspaceView || "dashboard";

      // Protected Routes
      const protectedViews = [
        "dashboard",
        "profile",
        "settings",
        "saved-resumes",
        "history",
        "analytics"
      ];

      if (
        protectedViews.includes(subView) &&
        !state.user
      ) {

        window.location.href = "./pages/login/login.html";
        return;

      }

      let subViewHtml = "";
      let bindSubViewEvents = null;

      switch (subView) {

        case "dashboard":
          subViewHtml = DashboardView.render();
          bindSubViewEvents = DashboardView.bindEvents;
          break;

        case "profile":
          subViewHtml = ProfileView.render();
          bindSubViewEvents = ProfileView.bindEvents;
          break;

        case "build-editor":
          subViewHtml = ResumeEditorView.render();
          bindSubViewEvents = ResumeEditorView.bindEvents;
          break;

        case "build-tailored":
          subViewHtml = TailoredResumeView.render();
          bindSubViewEvents = TailoredResumeView.bindEvents;
          break;

        case "build-templates":
          subViewHtml = TemplatesView.render();
          bindSubViewEvents = TemplatesView.bindEvents;
          break;

        case "analysis-ats":
          subViewHtml = AtsAnalysisView.render();
          bindSubViewEvents = AtsAnalysisView.bindEvents;
          break;

        case "analysis-suggestions":
          subViewHtml = AiSuggestionsView.render();
          bindSubViewEvents = AiSuggestionsView.bindEvents;
          break;

        case "analysis-jd":
          subViewHtml = JdMatchView.render();
          bindSubViewEvents = JdMatchView.bindEvents;
          break;

        case "assistant":
          subViewHtml = AiAssistantView.render();
          bindSubViewEvents = AiAssistantView.bindEvents;
          break;

        default:
          subViewHtml = DashboardView.render();
          bindSubViewEvents = DashboardView.bindEvents;

      }

      root.innerHTML = WorkspaceLayout.render(
        subView,
        subViewHtml
      );

      WorkspaceLayout.bindEvents();

      if (bindSubViewEvents)
        bindSubViewEvents();

    }

    // ===========================================
    // Public Pages
    // ===========================================

    else {

      if (landingHeader)
        landingHeader.style.display = "block";

      document.querySelectorAll(".nav-link").forEach((link) => {

        if (link.dataset.nav === viewName)

          link.classList.add("active");

        else

          link.classList.remove("active");

      });

      switch (viewName) {

        case "landing":

          root.innerHTML =
            LandingView.render() +
            this.renderFooter();

          LandingView.bindEvents();

          break;

        case "builder":

          root.innerHTML = BuilderView.render();

          BuilderView.bindEvents();

          break;

        case "templates":

          root.innerHTML = TemplatesView.render();

          TemplatesView.bindEvents();

          break;

        case "analyzer":

          root.innerHTML = AtsAnalysisView.render();

          AtsAnalysisView.bindEvents();

          break;

        case "suggestions":

          root.innerHTML = AiSuggestionsView.render();

          AiSuggestionsView.bindEvents();

          break;

        case "jdmatch":

          root.innerHTML = JdMatchView.render();

          JdMatchView.bindEvents();

          break;

        case "assistant":

          root.innerHTML = AiAssistantView.render();

          AiAssistantView.bindEvents();

          break;

        default:

          root.innerHTML =
            LandingView.render() +
            this.renderFooter();

          LandingView.bindEvents();

      }

    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  },
    // ===============================
  // Career Coach Drawer
  // ===============================
  renderCoachDrawer() {

    const host = document.getElementById("coach-drawer-host");

    if (!host) return;

    host.innerHTML = CareerCoachDrawer.render();

    CareerCoachDrawer.bindEvents();

  },

  // ===============================
  // Footer
  // ===============================
  renderFooter() {

    return `
      <footer class="footer">

        <div class="container">

          <div class="footer-grid">

            <div class="footer-col">

              <div class="brand-logo">

                <div class="brand-icon">
                  <i class="fa-solid fa-briefcase"></i>
                </div>

                <span>
                  HireFlow
                  <span style="color: var(--accent-blue);">
                    AI
                  </span>
                </span>

              </div>

              <p>
                Build ATS-friendly resumes, tailor every application,
                analyse resume performance and accelerate your career
                using AI.
              </p>

            </div>

            <div class="footer-col">

              <h4>Features</h4>

              <ul class="footer-links">

                <li>
                  <a href="#" data-nav="builder" class="footer-nav-link">
                    Build Resume
                  </a>
                </li>

                <li>
                  <a href="#" data-nav="templates" class="footer-nav-link">
                    Templates
                  </a>
                </li>

                <li>
                  <a href="#" data-nav="analyzer" class="footer-nav-link">
                    ATS Analysis
                  </a>
                </li>

                <li>
                  <a href="#" data-nav="assistant" class="footer-nav-link">
                    AI Assistant
                  </a>
                </li>

              </ul>

            </div>

            <div class="footer-col">

              <h4>Account</h4>

              <ul class="footer-links">

                <li>
                  <a href="./pages/login/login.html">
                    Sign In
                  </a>
                </li>

                <li>
                  <a href="./pages/signup/signup.html">
                    Create Account
                  </a>
                </li>

              </ul>

            </div>

          </div>

          <div class="footer-bottom">

            <span>
              © 2026 HireFlow AI. All Rights Reserved.
            </span>

          </div>

        </div>

      </footer>
    `;

  },

  // ===============================
  // Global Events
  // ===============================
  bindGlobalEvents() {

    // Brand Logo
    document
      .getElementById("nav-brand-logo")
      ?.addEventListener("click", (e) => {

        e.preventDefault();

        Store.setView("landing");

      });

    // Close Banner
    document
      .getElementById("btn-close-banner")
      ?.addEventListener("click", () => {

        document
          .getElementById("top-preview-banner")
          ?.remove();

      });

    // Theme Toggle
    document
      .getElementById("theme-toggle-switch")
      ?.addEventListener("click", () => {

        const current = Store.getState().theme;

        const next =
          current === "dark"
            ? "light"
            : "dark";

        Store.setTheme(next);

        Toast.show(
          `Switched to ${next.toUpperCase()} mode`,
          "success"
        );

      });

    // Navigation
    document
      .querySelectorAll(".nav-link, .footer-nav-link")
      .forEach((link) => {

        link.addEventListener("click", (e) => {

          e.preventDefault();

          const target = link.dataset.nav;

          if (!target) return;

          Store.setView(target);

        });

      });

    // Sign In
    document
      .getElementById("btn-nav-signin")
      ?.addEventListener("click", () => {

        window.location.href =
          "./pages/login/login.html";

      });

    // Build Resume
    document
      .getElementById("btn-nav-getstarted")
      ?.addEventListener("click", () => {

        Store.setView("builder");

      });

  },
  };

// ===============================
// Application Startup
// ===============================

// Restore route from URL hash (optional)
window.addEventListener("hashchange", () => {

  const hash = window.location.hash.replace("#", "");

  if (!hash) {

    Store.setView("landing");
    return;

  }

  const publicViews = [
    "landing",
    "builder",
    "templates",
    "analyzer",
    "suggestions",
    "jdmatch",
    "assistant",
    "workspace"
  ];

  if (publicViews.includes(hash)) {

    Store.setView(hash);

  }

});

// Initialize App
document.addEventListener("DOMContentLoaded", () => {

  // Default Route
  if (!window.location.hash) {

    Store.setView("landing");

  } else {

    const hash = window.location.hash.replace("#", "");

    Store.setView(hash);

  }

  App.init();

});