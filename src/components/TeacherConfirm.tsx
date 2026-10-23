import { useEffect, useId, useRef, type ReactNode } from 'react';
export default function TeacherConfirm({ title, children, confirmLabel, onConfirm, onCancel }: { title: string; children: ReactNode; confirmLabel: string; onConfirm: () => void; onCancel: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.current?.showModal();
    return () => { dialog.current?.close(); if (opener?.isConnected) opener.focus(); };
  }, []);
  return <dialog className="teacher-workspace tw-confirm" ref={dialog} aria-labelledby={id} onCancel={event => { event.preventDefault(); onCancel(); }}><h2 id={id}>{title}</h2><div>{children}</div><div className="tw-actions"><button type="button" onClick={onCancel} autoFocus>Giữ lại</button><button type="button" className="tw-danger" onClick={onConfirm}>{confirmLabel}</button></div></dialog>;
}
