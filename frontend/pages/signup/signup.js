(() => {
  const STORAGE_KEYS = {
    users: 'hf_users',
  };

  const LOGIN_URL = '../login/login.html';

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

  function isValidEmail(value) {
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

  document.addEventListener('DOMContentLoaded', () => {
    const form = $('signupForm');
    const fullNameInput = $('fullName');
    const emailInput = $('signupEmail');
    const passwordInput = $('signupPassword');
    const confirmPasswordInput = $('confirmPassword');
    const signupBtn = $('signupBtn');
    const pwToggle = $('signupPwToggle');
    const eyeIcon = $('signupEyeIcon');

    const fullNameError = $('fullNameError');
    const emailError = $('signupEmailError');
    const passwordError = $('signupPasswordError');
    const confirmPasswordError = $('confirmPasswordError');

    if (
      !form ||
      !fullNameInput ||
      !emailInput ||
      !passwordInput ||
      !confirmPasswordInput ||
      !signupBtn ||
      !pwToggle ||
      !eyeIcon ||
      !fullNameError ||
      !emailError ||
      !passwordError ||
      !confirmPasswordError
    ) {
      return;
    }

    function validateForm() {
      const fullNameValid = fullNameInput.value.trim().length >= 2;
      const emailValid = isValidEmail(emailInput.value.trim());
      const passwordValid = passwordInput.value.trim().length >= 8;
      const confirmValid = passwordInput.value === confirmPasswordInput.value && confirmPasswordInput.value.trim().length > 0;

      setFieldState(fullNameInput, fullNameError, fullNameValid, 'Full name is required.');
      setFieldState(emailInput, emailError, emailValid, 'Enter a valid email address.');
      setFieldState(passwordInput, passwordError, passwordValid, 'Password must be at least 8 characters long.');
      setFieldState(confirmPasswordInput, confirmPasswordError, confirmValid, 'Passwords do not match.');

      return fullNameValid && emailValid && passwordValid && confirmValid;
    }

    fullNameInput.addEventListener('blur', () => {
      setFieldState(fullNameInput, fullNameError, fullNameInput.value.trim().length >= 2, 'Full name is required.');
    });

    emailInput.addEventListener('blur', () => {
      setFieldState(emailInput, emailError, isValidEmail(emailInput.value.trim()), 'Enter a valid email address.');
    });

    passwordInput.addEventListener('blur', () => {
      setFieldState(passwordInput, passwordError, passwordInput.value.trim().length >= 8, 'Password must be at least 8 characters long.');
    });

    confirmPasswordInput.addEventListener('blur', () => {
      const matches = passwordInput.value === confirmPasswordInput.value && confirmPasswordInput.value.trim().length > 0;
      setFieldState(confirmPasswordInput, confirmPasswordError, matches, 'Passwords do not match.');
    });

    pwToggle.addEventListener('click', () => {
      const isHidden = passwordInput.type === 'password';
      passwordInput.type = isHidden ? 'text' : 'password';
      eyeIcon.innerHTML = isHidden
        ? '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.6 19.6 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a19.6 19.6 0 0 1-2.94 4.06M1 1l22 22"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>'
        : '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>';
      pwToggle.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!validateForm()) return;

      const email = emailInput.value.trim().toLowerCase();
      const users = loadUsers();
      const existingUser = users.find((user) => user.email.toLowerCase() === email);

      if (existingUser) {
        setFieldState(emailInput, emailError, false, 'An account with this email already exists.');
        return;
      }

      signupBtn.disabled = true;
      signupBtn.classList.add('loading');
      signupBtn.querySelector('.btn-label').textContent = 'Creating…';

      window.setTimeout(() => {
        users.push({
          name: fullNameInput.value.trim(),
          email,
          password: passwordInput.value,
          userType: 'experienced',
        });

        saveUsers(users);
        window.alert('Account created successfully. Please sign in.');
        window.location.href = LOGIN_URL;
      }, 900);
    });
  });
})();
