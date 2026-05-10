import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useToasts } from '../lib/store.js';

export function Toaster() {
  const toasts = useToasts((s) => s.toasts);
  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px',
      zIndex: 200, display: 'flex', flexDirection: 'column', gap: '8px',
    }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className="fade-in-up"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: '12px',
            minWidth: '260px',
          }}
        >
          {t.type === 'success' && <CheckCircle2 size={18} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />}
          {t.type === 'error' && <AlertCircle size={18} style={{ color: 'var(--color-destructive)', flexShrink: 0 }} />}
          {t.type === 'info' && <Info size={18} style={{ flexShrink: 0 }} />}
          <p style={{ fontSize: '14px' }}>{t.message}</p>
        </div>
      ))}
    </div>
  );
}
