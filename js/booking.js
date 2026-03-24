// booking.js — AJAX submit + confirmation message for Formsubmit.co

const form = document.querySelector('.booking-form');
if (form) {
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
          <p>Mensaje enviado</p>
          <span>Te contactaré pronto</span>
        </div>
      `;
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar';
      const existing = form.querySelector('.form-error');
      if (existing) existing.remove();
      const msg = document.createElement('div');
      msg.className = 'form-error';
      msg.textContent = 'Error al enviar. Inténtalo de nuevo.';
      submitBtn.after(msg);
      setTimeout(() => msg.remove(), 5000);
    }
  });
}
