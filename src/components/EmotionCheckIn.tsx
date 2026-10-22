import { useEffect, useRef } from 'react';
import { Flower2, X } from 'lucide-react';
import { EMOTIONS, type EmotionId } from '../lib/wellbeing';
import { Mascot } from './RoadmapMascot';
import './emotion-check-in.css';

export default function EmotionCheckIn({ onSelect, onClose }: { onSelect: (emotion: EmotionId) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const element = dialog.current;
    element?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus();
    };
  }, []);

  return (
    <dialog ref={dialog} className="emotion-check-in" aria-labelledby="check-in-title" aria-describedby="check-in-description" onCancel={event => { event.preventDefault(); onClose(); }}
      onKeyDown={event => {
        if (event.key !== 'Tab') return;
        const controls = dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}>
      <button type="button" className="emotion-close" onClick={onClose} aria-label="Đóng check-in cảm xúc" autoFocus><X size={22} /></button>
      <div className="emotion-landscape" aria-hidden="true"><img src="/illustrations/garden-story.jpg" alt="" /><div className="emotion-mascot"><Mascot mood="happy" /></div></div>
      <div className="emotion-content">
        <span className="emotion-eyebrow"><Flower2 size={16} aria-hidden="true" /> MẦM LẮNG NGHE BÉ</span>
        <h2 id="check-in-title">Hôm nay, bé thấy thế nào?</h2>
        <p id="check-in-description">Cảm xúc nào cũng được đón nhận.<br />Chọn khuôn mặt giống con lúc này nhé!</p>
        <div className="emotion-options">
          {EMOTIONS.map(emotion => <button type="button" key={emotion.id} className={`emotion-choice emotion-choice--${emotion.color}`} onClick={() => onSelect(emotion.id)}>
            <span className="emotion-face" aria-hidden="true">{emotion.emoji}</span><strong>{emotion.label}</strong><span className="emotion-description">{emotion.description}</span>
          </button>)}
        </div>
        <button type="button" className="emotion-later" onClick={onClose}>Để lúc khác nhé</button>
        <p className="emotion-privacy">Cảm xúc được ghi lại trên thiết bị để bố mẹ cùng lắng nghe con.</p>
      </div>
    </dialog>
  );
}
