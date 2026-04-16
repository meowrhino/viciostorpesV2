// booking.js — AJAX submit + confirmation message for Formsubmit.co
// Reads customizable texts (subject, confirmation, error) from data.json

(async function () {
  const form = document.querySelector('.booking-form');
  if (!form) return;

  // Default texts (fallback if data.json fails to load)
  let config = {
    emailSubject: 'New booking — ViciosTorpes',
    confirmation: { title: 'Message sent', message: "I'll contact you soon" },
    errorMessage: 'Failed to send. Please try again.',
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

  // --- Validación ------------------------------------------------------
  // Email: algo@algo.algo (sin espacios, al menos un punto después de @)
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Teléfono: dígitos, +, espacios, guiones, paréntesis, punto. 7-25 chars.
  //           Tras quitar separadores debe tener entre 7 y 15 dígitos (E.164).
  const PHONE_RE = /^[0-9+\s\-().]{7,25}$/;

  function setFieldError(input, message) {
    clearFieldError(input);
    input.classList.add('form-input-invalid');
    input.setAttribute('aria-invalid', 'true');
    const err = document.createElement('div');
    err.className = 'form-field-error';
    err.textContent = message;
    input.parentElement.appendChild(err);
  }

  function clearFieldError(input) {
    input.classList.remove('form-input-invalid');
    input.removeAttribute('aria-invalid');
    const err = input.parentElement.querySelector('.form-field-error');
    if (err) err.remove();
  }

  function validate() {
    let ok = true;
    const email = form.querySelector('#email');
    const phone = form.querySelector('#phone');

    if (email) {
      const v = email.value.trim();
      if (!v) {
        setFieldError(email, 'Email is required.');
        ok = false;
      } else if (!EMAIL_RE.test(v)) {
        setFieldError(email, 'Please enter a valid email (e.g. you@domain.com).');
        ok = false;
      } else {
        clearFieldError(email);
      }
    }

    if (phone && phone.value.trim()) {
      const v = phone.value.trim();
      const digits = v.replace(/[^\d]/g, '');
      if (!PHONE_RE.test(v) || digits.length < 7 || digits.length > 15) {
        setFieldError(phone, 'Invalid phone number (digits only, 7-15 digits, optional +).');
        ok = false;
      } else {
        clearFieldError(phone);
      }
    }

    return ok;
  }

  // Limpia el error al editar el campo
  ['email', 'phone'].forEach((id) => {
    const el = form.querySelector('#' + id);
    if (el) el.addEventListener('input', () => clearFieldError(el));
  });

  // --- Adjuntos: acumular en varias tandas + previsualización + eliminar ---
  const fileInput = form.querySelector('#attachment');
  const previewList = form.querySelector('#attachment-previews');
  // Fuente de verdad: array de File. El input.files se sincroniza vía DataTransfer.
  const attached = [];
  // Límites razonables para evitar correos enormes
  const MAX_FILES = 10;
  const MAX_FILE_MB = 8;
  const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

  function fileKey(f) {
    // Evita duplicados exactos
    return `${f.name}|${f.size}|${f.lastModified}`;
  }

  function syncInputFiles() {
    if (!window.DataTransfer) return; // fallback silencioso
    const dt = new DataTransfer();
    attached.forEach((f) => dt.items.add(f));
    fileInput.files = dt.files;
  }

  function renderPreviews() {
    previewList.innerHTML = '';
    attached.forEach((file, idx) => {
      const li = document.createElement('li');
      li.className = 'attachment-item';

      const thumbWrap = document.createElement('div');
      thumbWrap.className = 'attachment-thumb';
      if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.alt = file.name;
        img.src = URL.createObjectURL(file);
        img.onload = () => URL.revokeObjectURL(img.src);
        thumbWrap.appendChild(img);
      } else {
        thumbWrap.textContent = '📎';
      }

      const info = document.createElement('div');
      info.className = 'attachment-info';
      const name = document.createElement('span');
      name.className = 'attachment-name';
      name.textContent = file.name;
      const size = document.createElement('span');
      size.className = 'attachment-size';
      size.textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB';
      info.appendChild(name);
      info.appendChild(size);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'attachment-remove';
      remove.setAttribute('aria-label', 'Remove ' + file.name);
      remove.textContent = '✕';
      remove.addEventListener('click', () => {
        attached.splice(idx, 1);
        syncInputFiles();
        renderPreviews();
      });

      li.appendChild(thumbWrap);
      li.appendChild(info);
      li.appendChild(remove);
      previewList.appendChild(li);
    });
  }

  function showAttachmentError(message) {
    let err = fileInput.parentElement.querySelector('.form-field-error');
    if (!err) {
      err = document.createElement('div');
      err.className = 'form-field-error';
      fileInput.parentElement.insertBefore(err, previewList);
    }
    err.textContent = message;
    clearTimeout(showAttachmentError._t);
    showAttachmentError._t = setTimeout(() => err.remove(), 5000);
  }

  if (fileInput && previewList) {
    fileInput.addEventListener('change', () => {
      const incoming = Array.from(fileInput.files || []);
      const errors = [];
      const keys = new Set(attached.map(fileKey));

      for (const f of incoming) {
        if (attached.length >= MAX_FILES) {
          errors.push(`Maximum ${MAX_FILES} images.`);
          break;
        }
        if (f.size > MAX_FILE_BYTES) {
          errors.push(`"${f.name}" exceeds ${MAX_FILE_MB} MB.`);
          continue;
        }
        const key = fileKey(f);
        if (keys.has(key)) continue; // duplicado
        keys.add(key);
        attached.push(f);
      }
      // El input.files solo contiene la última selección; sincroniza con nuestro array
      syncInputFiles();
      renderPreviews();
      if (errors.length) showAttachmentError(errors.join(' '));
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validate()) {
      const firstInvalid = form.querySelector('.form-input-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const submitBtn = form.querySelector('.form-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

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
      submitBtn.textContent = 'Send';
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
