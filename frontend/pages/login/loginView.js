const LoginView = {

  render() {

    return `

<div class="split">

  <!-- Left Brand Panel -->

  <aside class="brand-panel">

    <div class="brand-top">

      <a
        href="#"
        id="login-logo"
        class="logo">

        <span class="logo-mark">
          R
        </span>

        ResumeAI

      </a>

      <span class="brand-eyebrow">

        <span class="brand-eyebrow-dot"></span>

        AI-Powered Career OS

      </span>

      <h1 class="brand-headline">

        Build better resumes.<br>

        <span class="accent">

          Land better jobs.

        </span>

      </h1>

      <p class="brand-sub">

        Create resumes,
        analyse ATS scores,
        tailor resumes for jobs,
        and prepare for interviews —
        all from one workspace.

      </p>

      <div class="feature-list">

        <!-- Feature 1 -->

        <div class="feature-item">

          <span class="feature-icon">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2">

              <path d="M12 2l2.4 7.2H22l-6 4.4 2.3 7.2-6.3-4.5-6.3 4.5 2.3-7.2-6-4.4h7.6z"/>

            </svg>

          </span>

          <div class="feature-text">

            <h4>
              AI-Powered Suggestions
            </h4>

            <p>
              Real-time content improvements
            </p>

          </div>

        </div>

        <!-- Feature 2 -->

        <div class="feature-item">

          <span class="feature-icon">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2">

              <circle cx="12" cy="12" r="8"/>

              <circle cx="12" cy="12" r="3"/>

            </svg>

          </span>

          <div class="feature-text">

            <h4>
              ATS Score Analyzer
            </h4>

            <p>
              Pass every applicant tracking system
            </p>

          </div>

        </div>

        <!-- Feature 3 -->

        <div class="feature-item">

          <span class="feature-icon">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2">

              <path d="M13 2L4 14h6l-1 8 9-12h-6z"/>

            </svg>

          </span>

          <div class="feature-text">

            <h4>

              Smart Resume Builder

            </h4>

            <p>

              From blank page to hire-ready in minutes

            </p>

          </div>

        </div>

        <!-- Feature 4 -->

        <div class="feature-item">

          <span class="feature-icon">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2">

              <path d="M12 2l8 4v6c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-4z"/>

            </svg>

          </span>

          <div class="feature-text">

            <h4>

              Secure & Private

            </h4>

            <p>

              Your data stays yours, always

            </p>

          </div>

        </div>

      </div>

    </div>

    <div class="brand-bottom">

      <div class="avatar-stack">

        <span>A</span>

        <span>M</span>

        <span>S</span>

        <span>K</span>

      </div>

      <p>

        Join professionals already building better resumes

      </p>

    </div>

  </aside>

  <!-- Right Form Panel -->

  <section class="form-panel">

    <div class="form-top">

      New here?

      <a
        href="#"
        id="goto-signup">

        Create account

      </a>

    </div>

    <div class="form-center">

      <h1>

        Welcome back

      </h1>

      <p class="lead">

        Sign in to continue your career journey

      </p>

      <div class="oauth-group">

        <button
          type="button"
          class="btn-oauth"
          id="googleBtn">

          <!-- Google SVG -->

          Continue with Google

        </button>

        <button
          type="button"
          class="btn-oauth"
          id="githubBtn">

          <!-- GitHub SVG -->

          Continue with GitHub

        </button>

      </div>

      <div class="divider">

        OR SIGN IN WITH EMAIL

      </div>
      <form id="loginForm" novalidate>

  <div class="field">

    <label for="email">
      Email
    </label>

    <input
      type="email"
      id="email"
      name="email"
      placeholder="you@example.com"
      autocomplete="email"
      required>

    <span
      class="error-msg"
      id="emailError">

      Enter a valid email address.

    </span>

  </div>

  <div class="field">

    <div class="field-row">

      <label for="password">
        Password
      </label>

      <a
        href="#"
        id="forgot-password"
        class="link-sm">

        Forgot?

      </a>

    </div>

    <div class="pw-wrap">

      <input
        type="password"
        id="password"
        name="password"
        placeholder="Enter your password"
        autocomplete="current-password"
        required>

      <button
        type="button"
        class="pw-toggle"
        id="pwToggle"
        aria-label="Show password">

        <svg
          id="eyeIcon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2">

          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>

          <circle
            cx="12"
            cy="12"
            r="3"/>

        </svg>

      </button>

    </div>

    <span
      class="error-msg"
      id="passwordError">

      Password is required.

    </span>

  </div>

  <button
    type="submit"
    class="btn-primary"
    id="loginBtn">

    <span class="spinner"></span>

    <span class="btn-label">

      Sign In

    </span>

  </button>

</form>

<p class="form-footer-line">

  Don't have an account?

  <a
    href="#"
    id="bottom-signup">

    Sign up

  </a>

</p>

    </div>

  </section>

</div>

`;

},
bindEvents() {

  // ===============================
  // Navigation
  // ===============================

  document.getElementById("login-logo")
  ?.addEventListener("click", (e) => {

    e.preventDefault();

    Store.setView("landing");

  });

  document.getElementById("goto-signup")
  ?.addEventListener("click", (e) => {

    e.preventDefault();

    Store.setView("signup");

  });

  document.getElementById("bottom-signup")
  ?.addEventListener("click", (e) => {

    e.preventDefault();

    Store.setView("signup");

  });

  document.getElementById("forgot-password")
  ?.addEventListener("click", (e) => {

    e.preventDefault();

    Toast.show(
      "Forgot password feature coming soon.",
      "info"
    );

  });

  // ===============================
  // Password Toggle
  // ===============================

  const password =
    document.getElementById("password");

  const toggle =
    document.getElementById("pwToggle");

  if (toggle && password) {

    toggle.addEventListener("click", () => {

      if (password.type === "password") {

        password.type = "text";

        toggle.setAttribute(
          "aria-label",
          "Hide password"
        );

      } else {

        password.type = "password";

        toggle.setAttribute(
          "aria-label",
          "Show password"
        );

      }

    });

  }

  // ===============================
  // Email Validation
  // ===============================

  const email =
    document.getElementById("email");

  const emailError =
    document.getElementById("emailError");

  function validateEmail() {

    const pattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const valid =
      pattern.test(email.value.trim());

    email.classList.toggle(
      "error",
      !valid
    );

    emailError.classList.toggle(
      "show",
      !valid
    );

    return valid;

  }

  email?.addEventListener(
    "blur",
    validateEmail
  );

  // ===============================
  // Password Validation
  // ===============================

  const passwordError =
    document.getElementById(
      "passwordError"
    );

  function validatePassword() {

    const valid =
      password.value.trim().length > 0;

    password.classList.toggle(
      "error",
      !valid
    );

    passwordError.classList.toggle(
      "show",
      !valid
    );

    return valid;

  }

  password?.addEventListener(
    "blur",
    validatePassword
  );

  // ===============================
  // Login Form
  // ===============================

  const form =
    document.getElementById("loginForm");

  const loginBtn =
    document.getElementById("loginBtn");

  form?.addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();

      const emailValid =
        validateEmail();

      const passwordValid =
        validatePassword();

      if (
        !emailValid ||
        !passwordValid
      ) {

        Toast.show(
          "Please fix the highlighted fields.",
          "warning"
        );

        return;

      }

      loginBtn.classList.add(
        "loading"
      );

      loginBtn.disabled = true;

      try {

        // Fake API delay

        await new Promise(resolve =>
          setTimeout(resolve, 1500)
        );

        Toast.show(
          "Login successful!",
          "success"
        );

        // Navigate to Workspace

        Store.setView("workspace");

      } catch {

        Toast.show(
          "Login failed.",
          "warning"
        );

      } finally {

        loginBtn.classList.remove(
          "loading"
        );

        loginBtn.disabled = false;

      }

    }
  );

  // ===============================
  // OAuth Buttons
  // ===============================

  document.getElementById("googleBtn")
  ?.addEventListener("click", () => {

    Toast.show(
      "Google Sign-In coming soon.",
      "info"
    );

  });

  document.getElementById("githubBtn")
  ?.addEventListener("click", () => {

    Toast.show(
      "GitHub Sign-In coming soon.",
      "info"
    );

  });

}

};

window.LoginView = LoginView;