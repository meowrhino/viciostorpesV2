// booking.js — Validación y manejo del formulario

console.log('Booking - Formulario cargado');

const form = document.getElementById('bookingForm');
const messageDiv = document.getElementById('formMessage');

// Manejar el envío del formulario
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Obtener datos del formulario
  const formData = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    location: document.getElementById('location').value.trim(),
    description: document.getElementById('description').value.trim()
  };
  
  console.log('Datos del formulario:', formData);
  
  // Validación básica
  if (!formData.name || !formData.email || !formData.location || !formData.description) {
    showMessage('Por favor, completa todos los campos obligatorios.', 'error');
    return;
  }
  
  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    showMessage('Por favor, introduce un email válido.', 'error');
    return;
  }
  
  // Simular envío (aquí conectarías con tu backend o servicio de email)
  try {
    // Deshabilitar botón mientras se envía
    const submitBtn = form.querySelector('.form-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Aquí irías tu lógica de envío real
    // Por ejemplo: await fetch('/api/booking', { method: 'POST', body: JSON.stringify(formData) })
    
    // Mostrar mensaje de éxito
    showMessage('¡Mensaje enviado! Te contactaré pronto.', 'success');
    
    // Limpiar formulario
    form.reset();
    
    // Restaurar botón
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar';
    
    console.log('Formulario enviado exitosamente');
    
  } catch (error) {
    console.error('Error al enviar formulario:', error);
    showMessage('Hubo un error al enviar el mensaje. Inténtalo de nuevo.', 'error');
    
    // Restaurar botón
    const submitBtn = form.querySelector('.form-submit');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar';
  }
});

// Mostrar mensaje de respuesta
function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `form-message ${type}`;
  messageDiv.classList.remove('hidden');
  
  // Ocultar mensaje después de 5 segundos
  setTimeout(() => {
    messageDiv.classList.add('hidden');
  }, 5000);
}

// Log de interacciones (opcional)
const inputs = form.querySelectorAll('input, textarea');
inputs.forEach(input => {
  input.addEventListener('focus', () => {
    console.log(`Campo enfocado: ${input.name}`);
  });
});
