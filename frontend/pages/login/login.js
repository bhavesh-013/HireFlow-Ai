(() => {
  const STORAGE_KEYS = {
    users: 'hf_users',
    token: 'hf_token',
    user: 'hf_user',
    rememberEmail: 'hf_remember_email',
  };

  const LOGIN_REDIRECT_URL = '../../index.html';

  function $(id) {
    return document.getElementById(id);
  }

  function loadUsers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.users);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function setFieldState(input, errorElement, isValid, message) {
    if (!input || !errorElement) return;

    if (isValid) {
      input.classList.remove('error');
      errorElement.classList.remove('show');
      return;
    }

    input.classList.add('error');
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }

  function setAuthSession(user) {
    const token = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(STORAGE_KEYS.token, token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  }

  function seedDemoUser() {
    const users = loadUsers();
    if (users.some((user) => user.email === 'alex@email.com')) return;

    users.push({
      name: 'Alexandra Chen',
      email: 'alex@email.com',
      password: 'Password123!',
      userType: 'experienced',
    });

    saveUsers(users);
  }

  document.addEventListener('DOMContentLoaded', () => {
    seedDemoUser();

    const form = $('loginForm');
    const emailInput = $('email');
    const passwordInput = $('password');
    const emailError = $('emailError');
    const passwordError = $('passwordError');
    const loginBtn = $('loginBtn');
    const pwToggle = $('pwToggle');
    const eyeIcon = $('eyeIcon');
    const googleBtn = $('googleBtn');
    const githubBtn = $('githubBtn');

    if (!form || !emailInput || !passwordInput || !emailError || !passwordError || !loginBtn || !pwToggle || !eyeIcon) {
      return;
    }

    const defaults = {
      email: emailError.textContent,
      password: passwordError.textContent,
    };

    const rememberedEmail = localStorage.getItem(STORAGE_KEYS.rememberEmail);
    if (rememberedEmail) {
      emailInput.value = rememberedEmail;
    }

    function resetError(el, defaultText) {
      el.textContent = defaultText;
      el.classList.remove('show');
    }

    function validateForm() {
      const emailValid = validateEmail(emailInput.value.trim());
      const passwordValid = passwordInput.value.trim().length > 0;

      setFieldState(emailInput, emailError, emailValid, 'Enter a valid email address.');
      setFieldState(passwordInput, passwordError, passwordValid, 'Password is required.');

      return emailValid && passwordValid;
    }

    emailInput.addEventListener('blur', () => {
      const isValid = validateEmail(emailInput.value.trim());
      setFieldState(emailInput, emailError, isValid, 'Enter a valid email address.');
    });

    passwordInput.addEventListener('blur', () => {
      const isValid = passwordInput.value.trim().length > 0;
      setFieldState(passwordInput, passwordError, isValid, 'Password is required.');
    });

    pwToggle.addEventListener('click', () => {
      const isHidden = passwordInput.type === 'password';
      passwordInput.type = isHidden ? 'text' : 'password';
      eyeIcon.innerHTML = isHidden
        ? '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.6 19.6 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a19.6 19.6 0 0 1-2.94 4.06M1 1l22 22"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>'
        : '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>';
      pwToggle.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });

    googleBtn?.addEventListener('click', () => {
      window.alert('Google sign-in is not connected in this demo.');
    });

    githubBtn?.addEventListener('click', () => {
      window.alert('GitHub sign-in is not connected in this demo.');
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!validateForm()) return;

      const email = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value;
      const users = loadUsers();
      const user = users.find((item) => item.email.toLowerCase() === email && item.password === password);

      if (!user) {
        setFieldState(passwordInput, passwordError, false, 'Invalid email or password.');
        return;
      }

      loginBtn.disabled = true;
      loginBtn.classList.add('loading');
      loginBtn.querySelector('.btn-label').textContent = 'Signing in…';

      localStorage.setItem(STORAGE_KEYS.rememberEmail, email);

      window.setTimeout(() => {
        setAuthSession({
          name: user.name,
          email: user.email,
          userType: user.userType || 'experienced',
        });

        window.location.href = LOGIN_REDIRECT_URL;
      }, 900);
    });

    [emailError, passwordError].forEach((el, index) => {
      if (el && defaults[index === 0 ? 'email' : 'password']) {
        resetError(el, defaults[index === 0 ? 'email' : 'password']);
      }
    });
  });
})();
