/**
 * HireFlow AI — Modal Component
 * Reusable modal system with backdrop, animations, and keyboard support.
 */

const Modal = {
  /**
   * Open a modal by ID
   * @param {string} modalId - The ID of the modal element
   */
  open(modalId) {
    const modal = document.getElementById(modalId);
    const backdrop = document.getElementById('modal-backdrop');
    if (!modal) return;

    if (!backdrop) {
      const bd = document.createElement('div');
      bd.id = 'modal-backdrop';
      bd.className = 'modal-backdrop';
      bd.addEventListener('click', () => Modal.close(modalId));
      document.body.appendChild(bd);
    }

    document.body.style.overflow = 'hidden';
    document.getElementById('modal-backdrop').classList.add('active');
    modal.classList.add('active');

    /* Focus trap */
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) focusable[0].focus();

    /* ESC to close */
    modal._escHandler = (e) => {
      if (e.key === 'Escape') Modal.close(modalId);
    };
    document.addEventListener('keydown', modal._escHandler);
  },

  /**
   * Close a modal by ID
   * @param {string} modalId - The ID of the modal element
   */
  close(modalId) {
    const modal = document.getElementById(modalId);
    const backdrop = document.getElementById('modal-backdrop');

    if (modal) {
      modal.classList.remove('active');
      if (modal._escHandler) {
        document.removeEventListener('keydown', modal._escHandler);
      }
    }

    if (backdrop) {
      backdrop.classList.remove('active');
    }

    document.body.style.overflow = '';
  },

  /**
   * Create and show a confirm dialog
   * @param {Object} options
   * @param {string} options.title
   * @param {string} options.message
   * @param {string} [options.confirmText='Confirm']
   * @param {string} [options.cancelText='Cancel']
   * @param {string} [options.type='primary'] - primary, danger
   * @returns {Promise<boolean>}
   */
  confirm({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'primary' }) {
    return new Promise((resolve) => {
      const id = 'modal-confirm-' + Date.now();

      const html = `
        <div id="${id}" class="modal">
          <div class="modal__header">
            <h3 class="modal__title">${title}</h3>
            <button class="modal__close" data-action="cancel">&times;</button>
          </div>
          <div class="modal__body">
            <p>${message}</p>
          </div>
          <div class="modal__footer">
            <button class="btn btn--secondary" data-action="cancel">${cancelText}</button>
            <button class="btn btn--${type}" data-action="confirm">${confirmText}</button>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', html);
      Modal.open(id);

      const modal = document.getElementById(id);
      modal.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'confirm') {
          resolve(true);
          Modal.close(id);
          setTimeout(() => modal.remove(), 300);
        } else if (action === 'cancel') {
          resolve(false);
          Modal.close(id);
          setTimeout(() => modal.remove(), 300);
        }
      });
    });
  }
};
