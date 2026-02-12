// booking.js — Form validation + EmailJS integration
// ⚠️  Configure the 3 IDs below — see docs/EMAILJS_SETUP.md

const EMAILJS_PUBLIC_KEY = 'TU_PUBLIC_KEY';      // TODO: replace
const EMAILJS_SERVICE_ID = 'TU_SERVICE_ID';      // TODO: replace
const EMAILJS_TEMPLATE_ID = 'TU_TEMPLATE_ID';    // TODO: replace

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

const form = document.getElementById('bookingForm');
const messageDiv = document.getElementById('formMessage');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    location: document.getElementById('location').value.trim(),
    description: document.getElementById('description').value.trim()
  };

  // Validation
  if (!formData.name || !formData.email || !formData.location || !formData.description) {
    showMessage('Por favor, completa todos los campos obligatorios.', 'error');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    showMessage('Por favor, introduce un email válido.', 'error');
    return;
  }

  const submitBtn = form.querySelector('.form-submit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';

  try {
    // Check if EmailJS is configured
    if (EMAILJS_PUBLIC_KEY === 'TU_PUBLIC_KEY') {
      console.warn('EmailJS not configured — simulating send. See docs/EMAILJS_SETUP.md');
      await new Promise(resolve => setTimeout(resolve, 1500));
    } else {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone,
        location: formData.location,
        description: formData.description,
      });
    }

    showMessage('¡Mensaje enviado! Te contactaré pronto.', 'success');
    form.reset();
  } catch (error) {
    console.error('EmailJS error:', error);
    showMessage('Hubo un error al enviar el mensaje. Inténtalo de nuevo.', 'error');
  }

  submitBtn.disabled = false;
  submitBtn.textContent = 'Enviar';
});

function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `form-message ${type}`;
  messageDiv.classList.remove('hidden');
  setTimeout(() => {
    messageDiv.classList.add('hidden');
  }, 5000);
}
