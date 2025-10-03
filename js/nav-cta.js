(() => {
  const subscribeBtn = document.querySelector('[data-subscribe-trigger]');
  const connectBtn = document.querySelector('[data-connect-trigger]');
  const subscribeModal = document.querySelector('[data-subscribe-modal]');
  const connectModal = document.querySelector('[data-connect-modal]');
  const subscribeForm = document.querySelector('[data-subscribe-form]');
  const subscribeInput = subscribeForm?.querySelector('input[type="email"]');
  const subscribeSubmit = subscribeForm?.querySelector('[data-subscribe-submit]');
  const subscribeHint = subscribeForm?.querySelector('[data-subscribe-hint]');
  const subscribeFeedback = subscribeForm?.querySelector('[data-subscribe-feedback]');

  const hiddenFormName = 'subscribe-form';

  const focusTrapSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  const openModal = (modal) => {
    if (!modal) return;
    modal.hidden = false;
    modal.dataset.open = 'true';
    const focusable = Array.from(modal.querySelectorAll(focusTrapSelectors)).filter((el) => !el.hasAttribute('disabled'));
    focusable[0]?.focus();
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.hidden = true;
    delete modal.dataset.open;
  };

  subscribeBtn?.addEventListener('click', () => openModal(subscribeModal));
  connectBtn?.addEventListener('click', () => openModal(connectModal));

  subscribeModal?.addEventListener('click', (event) => {
    if (event.target === subscribeModal || event.target.matches('[data-close-subscribe]')) {
      closeModal(subscribeModal);
    }
  });

  connectModal?.addEventListener('click', (event) => {
    if (event.target === connectModal || event.target.matches('[data-close-connect]')) {
      closeModal(connectModal);
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (subscribeModal?.dataset.open) closeModal(subscribeModal);
      if (connectModal?.dataset.open) closeModal(connectModal);
    }
  });

  const validateEmail = () => {
    if (!subscribeInput || !subscribeSubmit) return false;
    if (subscribeInput.value.trim() === '') {
      subscribeInput.classList.remove('is-valid', 'is-invalid');
      subscribeHint && (subscribeHint.textContent = '');
      subscribeSubmit.disabled = true;
      return false;
    }
    if (subscribeInput.checkValidity()) {
      subscribeInput.classList.add('is-valid');
      subscribeInput.classList.remove('is-invalid');
      subscribeHint && (subscribeHint.textContent = '');
      subscribeSubmit.disabled = false;
      return true;
    }
    subscribeInput.classList.add('is-invalid');
    subscribeInput.classList.remove('is-valid');
    subscribeHint && (subscribeHint.textContent = 'Please enter a valid email address.');
    subscribeSubmit.disabled = true;
    return false;
  };

  subscribeInput?.addEventListener('input', validateEmail);

  const encode = (data) => {
    return Object.keys(data)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
      .join('&');
  };

  subscribeForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateEmail()) return;

    subscribeSubmit.disabled = true;
    subscribeSubmit.textContent = 'sending…';
    subscribeFeedback && (subscribeFeedback.textContent = '');

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({ 'form-name': hiddenFormName, email: subscribeInput.value.trim() })
      });

      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

      subscribeFeedback && (subscribeFeedback.textContent = 'Thanks! Check your inbox for future updates.');
      subscribeFeedback?.classList.remove('is-error');
      subscribeInput.value = '';
      validateEmail();
      setTimeout(() => closeModal(subscribeModal), 1500);
    } catch (error) {
      subscribeFeedback && (subscribeFeedback.textContent = 'Something went wrong. Please try again later.');
      subscribeFeedback?.classList.add('is-error');
      subscribeSubmit.disabled = false;
      subscribeSubmit.textContent = 'subscribe';
      console.error('Netlify form submission failed:', error);
      return;
    }

    subscribeSubmit.textContent = 'subscribe';
  });

  document.querySelectorAll('.wallet-button')
    .forEach((button) => button.addEventListener('click', () => {
      const name = button.dataset.wallet || 'wallet';
      button.classList.add('wallet-button--selected');
      setTimeout(() => button.classList.remove('wallet-button--selected'), 800);
      console.info(`Wallet connect placeholder clicked: ${name}`);
    }));
})();
