import {useEffect, useId, useRef} from 'react';

const focusableSelector = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export default function Modal({isOpen, onClose, title, children, footer, size = 'md', closeOnOverlay = true, busy = false}) {
  const ref = useRef(null);
  const id = useId();
  useEffect(() => {
    if (!isOpen) return;
    const dialog = ref.current, previous = document.activeElement, overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    const focus = dialog.querySelector('input:not([disabled]),select:not([disabled]),textarea:not([disabled])')
      || dialog.querySelector('button:not([disabled])');
    (focus || dialog).focus();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus?.();
    };
  }, [isOpen]);
  const close = () => {if (!busy) onClose?.();};
  const trapFocus = event => {
    if (event.key !== 'Tab') return;
    const items = [...ref.current.querySelectorAll(focusableSelector)].filter(node => node.getClientRects().length);
    if (!items.length) {event.preventDefault(); ref.current.focus(); return;}
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && (document.activeElement === first || !ref.current.contains(document.activeElement))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  };
  if (!isOpen) return null;
  return <dialog ref={ref} tabIndex={-1} aria-labelledby={id} aria-busy={busy}
    onKeyDown={trapFocus} onCancel={event => {event.preventDefault(); close();}}
    onClick={event => {
      if (closeOnOverlay && event.target === ref.current) {
        const box = ref.current.getBoundingClientRect();
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) close();
      }
    }}
    className={'m-auto w-[calc(100%_-_2rem)] rounded-panel border border-line bg-white p-0 text-ink shadow-xl backdrop:bg-navy-900/60 '
      + ({sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl'}[size])}>
    <header className="flex justify-between border-b p-4">
      <h2 id={id} className="text-lg font-semibold">{title}</h2>
      <button type="button" disabled={busy} onClick={close} aria-label="Đóng cửa sổ">✕</button>
    </header>
    <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>{footer}
  </dialog>;
}
