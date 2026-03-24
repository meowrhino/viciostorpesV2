// booking.js — AJAX submit + confirmation message for Formsubmit.co

const form = document.querySelector('.booking-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = form.querySelector('.form-submit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';

  try {
    const formData = new FormData(form);
    await fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' },
    });

    // Replace form with confirmation
    form.innerHTML = `
      <div class="form-confirmation">
        <p>Mensaje enviado</p>
        <span>Te contactaré pronto</span>
      </div>
    `;
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar';
    // Show inline error
    const msg = document.createElement('div');
    msg.className = 'form-error';
    msg.textContent = 'Error al enviar. Inténtalo de nuevo.';
    submitBtn.after(msg);
    setTimeout(() => msg.remove(), 5000);
  }
});
