import { useEffect, useRef, type RefObject } from 'react';

export interface UseModalDialogOptions {
  isOpen: boolean;
  onClose: () => void;
  isDismissDisabled?: boolean;
  dialogRef: Readonly<RefObject<HTMLElement | null>>;
  initialFocusRef?: Readonly<RefObject<HTMLElement | null>>;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'summary',
  'iframe',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(', ');

let bodyScrollLockCount = 0;
let savedBodyOverflow = '';
const activeModalStack: symbol[] = [];

function isElementFocusable(element: HTMLElement): boolean {
  if (!element.isConnected) {
    return false;
  }

  if (element instanceof HTMLInputElement && element.type === 'hidden') {
    return false;
  }

  if (
    element.hasAttribute('disabled') ||
    ('disabled' in element && Boolean((element as { disabled?: unknown }).disabled)) ||
    element.matches(':disabled')
  ) {
    return false;
  }

  if (element.getAttribute('aria-disabled') === 'true') {
    return false;
  }

  if (element.tabIndex < 0) {
    return false;
  }

  if (element.closest('[hidden], [inert], [aria-hidden="true"]')) {
    return false;
  }

  if (window.getComputedStyle(element).visibility === 'hidden') {
    return false;
  }

  let current: HTMLElement | null = element;
  while (current) {
    if (window.getComputedStyle(current).display === 'none') {
      return false;
    }
    current = current.parentElement;
  }

  return true;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const candidates = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return candidates.filter(isElementFocusable);
}

/**
 * Manages W3C WAI-ARIA APG 1.2 modal dialog behavior:
 * ref-counted body scroll lock, initial focus, Tab focus trap, Escape dismiss, and focus restoration.
 */
export function useModalDialog({
  isOpen,
  onClose,
  isDismissDisabled = false,
  dialogRef,
  initialFocusRef,
}: UseModalDialogOptions): void {
  const onCloseRef = useRef(onClose);
  const isDismissDisabledRef = useRef(isDismissDisabled);

  useEffect(() => {
    onCloseRef.current = onClose;
    isDismissDisabledRef.current = isDismissDisabled;
  }, [onClose, isDismissDisabled]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const dialogEl = dialogRef.current;
    if (!dialogEl) {
      return;
    }

    const previousActiveElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const modalToken = Symbol('modal-dialog');
    activeModalStack.push(modalToken);
    if (bodyScrollLockCount === 0) {
      savedBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    bodyScrollLockCount += 1;

    const initialEl = initialFocusRef?.current ?? null;
    if (initialEl && dialogEl.contains(initialEl) && isElementFocusable(initialEl)) {
      initialEl.focus({ preventScroll: true });
    } else {
      const focusables = getFocusableElements(dialogEl);
      if (focusables.length > 0) {
        focusables[0].focus({ preventScroll: true });
      } else {
        dialogEl.focus({ preventScroll: true });
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (activeModalStack[activeModalStack.length - 1] !== modalToken) {
        return;
      }

      if (event.key === 'Escape') {
        if (!isDismissDisabledRef.current) {
          event.preventDefault();
          event.stopPropagation();
          onCloseRef.current();
        }
        return;
      }

      if (event.key === 'Tab') {
        const focusables = getFocusableElements(dialogEl);
        if (focusables.length === 0) {
          event.preventDefault();
          dialogEl.focus({ preventScroll: true });
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const activeElement =
          document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const isInsideDialog = activeElement !== null && dialogEl.contains(activeElement);

        if (event.shiftKey) {
          const isBeforeFirst =
            activeElement !== null &&
            isInsideDialog &&
            !focusables.includes(activeElement) &&
            (first.compareDocumentPosition(activeElement) & Node.DOCUMENT_POSITION_PRECEDING) !== 0;

          if (!isInsideDialog || activeElement === dialogEl || activeElement === first || isBeforeFirst) {
            event.preventDefault();
            last.focus({ preventScroll: true });
          }
        } else {
          const isAfterLast =
            activeElement !== null &&
            isInsideDialog &&
            !focusables.includes(activeElement) &&
            (last.compareDocumentPosition(activeElement) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

          if (!isInsideDialog || activeElement === dialogEl || activeElement === last || isAfterLast) {
            event.preventDefault();
            first.focus({ preventScroll: true });
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      const stackIndex = activeModalStack.lastIndexOf(modalToken);
      if (stackIndex !== -1) {
        activeModalStack.splice(stackIndex, 1);
      }

      bodyScrollLockCount = Math.max(0, bodyScrollLockCount - 1);
      if (bodyScrollLockCount === 0) {
        document.body.style.overflow = savedBodyOverflow;
        savedBodyOverflow = '';
      }

      if (previousActiveElement?.isConnected) {
        previousActiveElement.focus({ preventScroll: true });
      } else {
        const mainContent = document.getElementById('main-content');
        if (mainContent instanceof HTMLElement) {
          mainContent.focus({ preventScroll: true });
        }
      }
    };
  }, [isOpen, dialogRef, initialFocusRef]);
}
