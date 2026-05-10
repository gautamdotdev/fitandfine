import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useToasts } from '../lib/store.js';

export function Toaster() {
  const toasts = useToasts((s) => s.toasts);
  return (
    <div className="toaster-container" style={{
      position: 'fixed', bottom: '24px', right: '24px',
      zIndex: 200, display: 'flex', flexDirection: 'column', gap: '8px',
    }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast-item"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            borderRadius: '12px',
            padding: '14px 20px',
            display: 'flex', alignItems: 'center', gap: '12px',
            minWidth: '280px',
            backdropFilter: 'blur(8px)',
          }}
        >
          {t.type === 'success' && <CheckCircle2 size={18} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />}
          {t.type === 'error' && <AlertCircle size={18} style={{ color: 'var(--color-destructive)', flexShrink: 0 }} />}
          {t.type === 'info' && <Info size={18} style={{ flexShrink: 0 }} />}
          <p style={{ fontSize: '14px', fontWeight: 500, letterSpacing: '0.01em' }}>{t.message}</p>
        </div>
      ))}

      <style>{`
        .toast-item {
          animation: toastIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 640px) {
          .toaster-container {
            right: 20px !important;
            left: 20px !important;
            bottom: 20px !important;
            align-items: center;
          }
          .toast-item {
            width: 100%;
            max-width: 400px;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
