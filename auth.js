const loginForm = document.querySelector('#loginForm');
const registerForm = document.querySelector('#registerForm');
const authError = document.querySelector('#authError');
const formEyebrow = document.querySelector('#formEyebrow');
const formTitle = document.querySelector('#formTitle');
const formSubtitle = document.querySelector('#formSubtitle');
const authSwitch = document.querySelector('#authSwitch');
const loginSwitch = document.querySelector('#loginSwitch');

function showError(message) {
  authError.textContent = message;
  authError.classList.remove('success', 'warning');
  authError.hidden = false;
}

function showStatus(message, status) {
  authError.textContent = message;
  authError.classList.remove('success', 'warning');
  authError.classList.add(status);
  authError.hidden = false;
}

function setMode(mode) {
  const registering = mode === 'register';
  loginForm.hidden = registering;
  registerForm.hidden = !registering;
  authSwitch.hidden = registering;
  loginSwitch.hidden = !registering;
  formEyebrow.textContent = registering ? 'START YOUR JOURNEY' : 'WELCOME BACK';
  formTitle.textContent = registering ? 'Create your account' : 'Sign in to FitBuddy AI';
  formSubtitle.textContent = registering ? 'Your personalized fitness journey starts here.' : 'Pick up where you left off.';
  authError.hidden = true;
}

async function submitAuth(form, endpoint) {
  authError.hidden = true;
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  try {
    const values = Object.fromEntries(new FormData(form).entries());
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to sign in');
    if (endpoint === '/api/auth/login') {
      const confirmation = result.signInConfirmation;
      if (confirmation) {
        const statusClass = confirmation.status === 'sent' ? 'success' : 'warning';
        showStatus(confirmation.message, statusClass);
        window.setTimeout(() => {
          window.location.assign(`/?signin=${encodeURIComponent(confirmation.status)}`);
        }, 900);
        return;
      }
    }
    window.location.assign('/');
  } catch (error) {
    showError(error.message);
  } finally {
    submitButton.disabled = false;
  }
}

document.querySelectorAll('[data-mode]').forEach((button) => {
  button.addEventListener('click', () => setMode(button.dataset.mode));
});

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  submitAuth(loginForm, '/api/auth/login');
});

registerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  submitAuth(registerForm, '/api/auth/register');
});

const errorMessages = {
  google_not_configured: 'Google sign-in needs OAuth credentials. Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it.',
  google_state: 'Google sign-in could not be verified. Please try again.',
  google_cancelled: 'Google sign-in was cancelled.',
  google_failed: 'Google sign-in failed. Please try again.'
};
const queryError = new URLSearchParams(window.location.search).get('error');
if (queryError) showError(errorMessages[queryError] || 'Unable to sign in. Please try again.');

fetch('/api/auth/me').then((response) => response.json()).then((result) => {
  if (result.authenticated) window.location.replace('/');
}).catch(() => {});
