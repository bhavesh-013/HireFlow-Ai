const SignupView = {

    render() {

        return `

<div class="split">

    <!-- Left Brand Panel -->

    <aside class="brand-panel">

        <div class="brand-top">

            <a
                href="#"
                id="signup-logo"
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

                Create your account.<br>

                <span class="accent">

                    Start building faster.

                </span>

            </h1>

            <p class="brand-sub">

                Sign up to create ATS-friendly resumes,
                tailor them for jobs,
                import GitHub projects,
                and keep every version organized in one place.

            </p>

            <div class="feature-list">

                <div class="feature-item">

                    <span class="feature-icon">

                        <svg viewBox="0 0 24 24"
                             fill="none"
                             stroke="currentColor"
                             stroke-width="2">

                            <path d="M12 2l2.4 7.2H22l-6 4.4 2.3 7.2-6.3-4.5-6.3 4.5 2.3-7.2-6-4.4h7.6z"/>

                        </svg>

                    </span>

                    <div class="feature-text">

                        <h4>

                            AI Resume Builder

                        </h4>

                        <p>

                            Generate high-impact resume content

                        </p>

                    </div>

                </div>

                <div class="feature-item">

                    <span class="feature-icon">

                        <svg viewBox="0 0 24 24"
                             fill="none"
                             stroke="currentColor"
                             stroke-width="2">

                            <circle cx="12" cy="12" r="8"/>

                            <circle cx="12" cy="12" r="3"/>

                        </svg>

                    </span>

                    <div class="feature-text">

                        <h4>

                            ATS Analysis

                        </h4>

                        <p>

                            Improve match percentage before applying

                        </p>

                    </div>

                </div>

                <div class="feature-item">

                    <span class="feature-icon">

                        <svg viewBox="0 0 24 24"
                             fill="none"
                             stroke="currentColor"
                             stroke-width="2">

                            <path d="M13 2L4 14h6l-1 8 9-12h-6z"/>

                        </svg>

                    </span>

                    <div class="feature-text">

                        <h4>

                            GitHub Import

                        </h4>

                        <p>

                            Turn projects into polished resume bullets

                        </p>

                    </div>

                </div>

                <div class="feature-item">

                    <span class="feature-icon">

                        <svg viewBox="0 0 24 24"
                             fill="none"
                             stroke="currentColor"
                             stroke-width="2">

                            <path d="M12 2l8 4v6c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-4z"/>

                        </svg>

                    </span>

                    <div class="feature-text">

                        <h4>

                            Version Manager

                        </h4>

                        <p>

                            Keep one master resume and tailor variants

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

            Already have an account?

            <a
                href="#"
                id="goto-login">

                Sign in

            </a>

        </div>

        <div class="form-center">

            <h1>

                Create your account

            </h1>

            <p class="lead">

                Set up your HireFlow AI workspace in under a minute

            </p>

            <form
                id="signupForm"
                novalidate>

                <div class="field">

                    <label for="fullName">

                        Full name

                    </label>

                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        placeholder="Alexandra Chen"
                        autocomplete="name"
                        required>

                    <span
                        class="error-msg"
                        id="fullNameError">

                        Full name is required.

                    </span>

                </div>

                <div class="field">

                    <label for="signupEmail">

                        Email

                    </label>

                    <input
                        type="email"
                        id="signupEmail"
                        name="signupEmail"
                        placeholder="you@example.com"
                        autocomplete="email"
                        required>

                    <span
                        class="error-msg"
                        id="signupEmailError">

                        Enter a valid email address.

                    </span>

                </div>
                                <div class="field">

                    <label for="signupPassword">

                        Password

                    </label>

                    <div class="pw-wrap">

                        <input
                            type="password"
                            id="signupPassword"
                            name="signupPassword"
                            placeholder="Create a strong password"
                            autocomplete="new-password"
                            required>

                        <button
                            type="button"
                            class="pw-toggle"
                            id="signupPwToggle"
                            aria-label="Show password">

                            <svg
                                id="signupEyeIcon"
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
                        id="signupPasswordError">

                        Password must be at least 8 characters long.

                    </span>

                </div>

                <div class="field">

                    <label for="confirmPassword">

                        Confirm password

                    </label>

                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Re-enter your password"
                        autocomplete="new-password"
                        required>

                    <span
                        class="error-msg"
                        id="confirmPasswordError">

                        Passwords do not match.

                    </span>

                </div>

                <button
                    type="submit"
                    class="btn-primary"
                    id="signupBtn">

                    <span class="spinner"></span>

                    <span class="btn-label">

                        Create account

                    </span>

                </button>

            </form>

            <p class="form-footer-line">

                By creating an account,
                you agree to use HireFlow AI
                for personal resume management.

            </p>

            <p class="form-footer-line">

                Already registered?

                <a
                    href="#"
                    id="bottom-login">

                    Sign in

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

        document.getElementById("signup-logo")
        ?.addEventListener("click", (e) => {

            e.preventDefault();

            Store.setView("landing");

        });

        document.getElementById("goto-login")
        ?.addEventListener("click", (e) => {

            e.preventDefault();

            Store.setView("login");

        });

        document.getElementById("bottom-login")
        ?.addEventListener("click", (e) => {

            e.preventDefault();

            Store.setView("login");

        });

        // ===============================
        // Password Toggle
        // ===============================

        const password =
            document.getElementById("signupPassword");

        const toggle =
            document.getElementById("signupPwToggle");

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
        // Form Elements
        // ===============================

        const fullName =
            document.getElementById("fullName");

        const email =
            document.getElementById("signupEmail");

        const confirmPassword =
            document.getElementById("confirmPassword");

        const fullNameError =
            document.getElementById("fullNameError");

        const emailError =
            document.getElementById("signupEmailError");

        const passwordError =
            document.getElementById("signupPasswordError");

        const confirmPasswordError =
            document.getElementById("confirmPasswordError");

        // ===============================
        // Validators
        // ===============================

        function validateName() {

            const valid =
                fullName.value.trim().length > 1;

            fullName.classList.toggle(
                "error",
                !valid
            );

            fullNameError.classList.toggle(
                "show",
                !valid
            );

            return valid;

        }

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

        function validatePassword() {

            const valid =
                password.value.length >= 8;

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

        function validateConfirmPassword() {

            const valid =
                confirmPassword.value === password.value &&
                confirmPassword.value !== "";

            confirmPassword.classList.toggle(
                "error",
                !valid
            );

            confirmPasswordError.classList.toggle(
                "show",
                !valid
            );

            return valid;

        }

        // ===============================
        // Blur Validation
        // ===============================

        fullName?.addEventListener(
            "blur",
            validateName
        );

        email?.addEventListener(
            "blur",
            validateEmail
        );

        password?.addEventListener(
            "blur",
            validatePassword
        );

        confirmPassword?.addEventListener(
            "blur",
            validateConfirmPassword
        );

        // ===============================
        // Form Submit
        // ===============================

        const form =
            document.getElementById("signupForm");

        const signupBtn =
            document.getElementById("signupBtn");

        form?.addEventListener(
            "submit",
            async (e) => {

                e.preventDefault();

                const nameValid =
                    validateName();

                const emailValid =
                    validateEmail();

                const passwordValid =
                    validatePassword();

                const confirmValid =
                    validateConfirmPassword();

                if (
                    !nameValid ||
                    !emailValid ||
                    !passwordValid ||
                    !confirmValid
                ) {

                    Toast.show(
                        "Please correct the highlighted fields.",
                        "warning"
                    );

                    return;

                }

                signupBtn.classList.add(
                    "loading"
                );

                signupBtn.disabled = true;

                try {

                    // Fake API request

                    await new Promise(resolve =>
                        setTimeout(resolve, 1800)
                    );

                    Toast.show(
                        "Account created successfully!",
                        "success"
                    );

                    Store.setView("workspace");

                } catch {

                    Toast.show(
                        "Something went wrong.",
                        "warning"
                    );

                } finally {

                    signupBtn.classList.remove(
                        "loading"
                    );

                    signupBtn.disabled = false;

                }

            }
        );

    }

};

window.SignupView = SignupView;