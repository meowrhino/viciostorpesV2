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
    const data = await window.loadSiteData();
    if (data.booking) config = { ...config, ...data.booking };
  } catch (err) {
    console.warn('booking.js: Failed to load data.json, using defaults', err);
  }

  // Apply email subject to the hidden Formsubmit field
  const subjectInput = form.querySelector('input[name="_subject"]');
  if (subjectInput) subjectInput.value = config.emailSubject;

  // Si volvemos de Formsubmit tras un envío con adjuntos (_next?sent=1),
  // mostramos la confirmación sin esperar a que el usuario toque nada.
  if (new URLSearchParams(location.search).get('sent') === '1') {
    showConfirmation(config);
    // Limpia la URL para que no se vuelva a mostrar en recarga
    history.replaceState({}, '', location.pathname);
    return;
  }

  // --- Validación ------------------------------------------------------
  // Email: algo@algo.algo (sin espacios, al menos un punto después de @)
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Instagram: 1-30 chars (letras, dígitos, punto, guion bajo), @ opcional delante.
  const IG_RE = /^@?[A-Za-z0-9._]{1,30}$/;

  function showConfirmation(cfg) {
    form.innerHTML = `
      <div class="form-confirmation">
        <p>${cfg.confirmation.title}</p>
        <span>${cfg.confirmation.message}</span>
      </div>
    `;
  }

  function setFieldError(input, message) {
    clearFieldError(input);
    input.classList.add('form-input-invalid');
    input.setAttribute('aria-invalid', 'true');
    const err = document.createElement('div');
    err.className = 'form-field-error';
    err.textContent = message;
    const errorId = (input.id || input.name) + '-error';
    err.id = errorId;
    input.setAttribute('aria-describedby', errorId);
    input.parentElement.appendChild(err);
  }

  function clearFieldError(input) {
    input.classList.remove('form-input-invalid');
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    const err = input.parentElement.querySelector('.form-field-error');
    if (err) err.remove();
  }

  function validate() {
    let ok = true;
    const email = form.querySelector('#email');

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

    const instagram = form.querySelector('#instagram');
    if (instagram && instagram.value.trim()) {
      const v = instagram.value.trim();
      if (!IG_RE.test(v)) {
        setFieldError(instagram, 'Invalid Instagram handle (letters, digits, . or _).');
        ok = false;
      } else {
        clearFieldError(instagram);
      }
    }

    return ok;
  }

  // Limpia el error al editar el campo
  ['email', 'instagram'].forEach((id) => {
    const el = form.querySelector('#' + id);
    if (el) el.addEventListener('input', () => clearFieldError(el));
  });

  // --- Adjuntos: acumular en varias tandas + previsualización + eliminar ---
  const fileInput = form.querySelector('#attachment');
  const previewList = form.querySelector('#attachment-previews');
  // Fuente de verdad: array de File. El input.files se sincroniza vía DataTransfer.
  const attached = [];
  let attachmentErrorTimeout = null;
  // Límites: Formsubmit caps total attachment size at 10 MB. Dejamos buffer.
  const MAX_FILES = 10;
  const MAX_FILE_MB = 5;
  const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
  const MAX_TOTAL_MB = 9;
  const MAX_TOTAL_BYTES = MAX_TOTAL_MB * 1024 * 1024;

  function totalSize() {
    return attached.reduce((sum, f) => sum + f.size, 0);
  }

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
    clearTimeout(attachmentErrorTimeout);
    attachmentErrorTimeout = setTimeout(() => err.remove(), 5000);
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
        if (totalSize() + f.size > MAX_TOTAL_BYTES) {
          errors.push(`Total size would exceed ${MAX_TOTAL_MB} MB.`);
          break;
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

    // Total size guard (Formsubmit cap ~10 MB)
    if (totalSize() > MAX_TOTAL_BYTES) {
      showAttachmentError(`Total size exceeds ${MAX_TOTAL_MB} MB. Remove some images.`);
      return;
    }

    const submitBtn = form.querySelector('.form-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    // --- Dos rutas de envío ---
    // El endpoint AJAX de Formsubmit NO adjunta archivos de forma fiable
    // (sus docs omiten el caso y avisan de que autoresponse falla en AJAX).
    // Por eso, si hay adjuntos, hacemos submit nativo: el navegador sube los
    // archivos como multipart, Formsubmit los adjunta al correo, y `_next`
    // nos trae de vuelta a booking.html?sent=1 donde mostramos la confirmación.
    if (attached.length > 0) {
      // Sustituye el input múltiple por N inputs de archivo con nombres
      // distintos (attachment1, attachment2, ...) — el formato que los
      // docs de Formsubmit recomiendan ("use several file input fields").
      const parent = fileInput.parentElement;
      fileInput.remove();
      attached.forEach((f, i) => {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'file';
        hiddenInput.name = 'attachment' + (i + 1);
        hiddenInput.style.display = 'none';
        const dt = new DataTransfer();
        dt.items.add(f);
        hiddenInput.files = dt.files;
        parent.appendChild(hiddenInput);
      });
      // Envío nativo: el navegador navega a Formsubmit y vuelve a ?sent=1.
      form.submit();
      return;
    }

    // Sin adjuntos: AJAX para confirmación inline (sin navegación).
    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) throw new Error(response.statusText);

      showConfirmation(config);
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
