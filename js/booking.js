// booking.js — AJAX submit + confirmation message for Formsubmit.co
// Reads customizable texts (subject, confirmation, error) from data.json

(async function () {
  const form = document.querySelector('.booking-form');
  if (!form) return;

  // Default texts (fallback if data.json fails to load)
  let config = {
    emailSubject: 'Nueva reserva — ViciosTorpes',
    confirmation: { title: 'Mensaje enviado', message: 'Te contactaré pronto' },
    errorMessage: 'Error al enviar. Inténtalo de nuevo.',
  };

  try {
    const data = await fetch('data.json').then(r => r.json());
    if (data.booking) config = { ...config, ...data.booking };
  } catch (err) {
    console.warn('booking.js: Failed to load data.json, using defaults', err);
  }

  // Apply email subject to the hidden Formsubmit field
  const subjectInput = form.querySelector('input[name="_subject"]');
  if (subjectInput) subjectInput.value = config.emailSubject;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('.form-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) throw new Error(response.statusText);

      // Replace form with confirmation
      form.innerHTML = `
        <div class="form-confirmation">
          <p>${config.confirmation.title}</p>
          <span>${config.confirmation.message}</span>
        </div>
      `;
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar';
      const existing = form.querySelector('.form-error');
      if (existing) existing.remove();
      const msg = document.createElement('div');
      msg.className = 'form-error';
      msg.textContent = config.errorMessage;
      submitBtn.after(msg);
      setTimeout(() => msg.remove(), 5000);
    }
  });
})();
