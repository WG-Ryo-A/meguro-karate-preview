(() => {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  function closeMenu() {
    if (!toggle || !mobileMenu) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'メニューを開く');
    mobileMenu.hidden = true;
  }
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    mobileMenu.hidden = !open;
  });
  mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { closeMenu(); toggle.focus(); }
  });
  document.addEventListener('click', event => {
    if (mobileMenu && toggle && !mobileMenu.contains(event.target) && !toggle.contains(event.target)) closeMenu();
  });
  const desktop = window.matchMedia('(min-width: 761px)');
  desktop.addEventListener?.('change', closeMenu);

  const filmDialog = document.getElementById('film-dialog');
  const film = document.getElementById('team-film');
  const sponsorsDialog = document.getElementById('sponsors-dialog');
  let activeOpener = null;
  function openDialog(dialog, opener) {
    if (!dialog) return;
    activeOpener = opener;
    if (typeof dialog.showModal !== 'function') {
      window.open(dialog === filmDialog ? (film?.dataset.src || 'assets/team-film.mp4') : 'assets/sponsor-board.jpg', '_blank', 'noopener');
      return;
    }
    closeMenu();
    dialog.showModal();
    document.body.classList.add('dialog-open');
    dialog.querySelector('[data-close-dialog]')?.focus();
  }
  document.querySelectorAll('[data-open-film]').forEach(button => button.addEventListener('click', () => {
    openDialog(filmDialog, button);
    if (film && filmDialog?.open) {
      if (!film.getAttribute('src')) {
        const embedded = document.getElementById('embedded-film-data');
        if (embedded) {
          const binary = atob(embedded.textContent.trim());
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          film.src = URL.createObjectURL(new Blob([bytes], { type: 'video/mp4' }));
        } else {
          film.src = film.dataset.src;
        }
      }
      // No background autoplay or prefetch. Media loads only after an explicit click.
      film.play().catch(() => { /* Native controls remain available if autoplay is blocked. */ });
    }
  }));
  document.querySelectorAll('[data-open-sponsors]').forEach(button => button.addEventListener('click', () => openDialog(sponsorsDialog, button)));
  document.querySelectorAll('.media-dialog').forEach(dialog => {
    dialog.querySelector('[data-close-dialog]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (dialog === filmDialog) film?.pause();
      document.body.classList.remove('dialog-open');
      activeOpener?.focus();
    });
  });

  document.querySelectorAll('[data-copy-email]').forEach(button => button.addEventListener('click', async () => {
    const email = button.dataset.copyEmail;
    const status = document.querySelector('.copy-feedback');
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(email);
      else {
        const input = document.createElement('textarea');
        input.value = email;
        input.setAttribute('readonly', '');
        input.className = 'clipboard-helper';
        document.body.appendChild(input);
        input.select();
        const copied = document.execCommand('copy');
        input.remove();
        if (!copied) throw new Error('Copy unavailable');
      }
      if (status) status.textContent = 'メールアドレスをコピーしました。';
    } catch {
      if (status) status.textContent = 'アドレスを長押し、または選択してコピーしてください。';
    }
    button.focus();
  }));

  const sticky = document.querySelector('.mobile-contact');
  const contact = document.querySelector('.contact-button');
  const footer = document.querySelector('.site-footer');
  if (sticky && contact && 'IntersectionObserver' in window) {
    const visible = new Set();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
      sticky.classList.toggle('is-hidden', visible.size > 0);
      if ('inert' in sticky) sticky.inert = visible.size > 0;
    }, { threshold: 0.03 });
    observer.observe(contact);
    if (footer) observer.observe(footer);
  }
})();
