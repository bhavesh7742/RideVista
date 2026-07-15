import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDanger = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="rv-glass max-w-md w-full p-6 space-y-4 relative rv-animate-scaleIn animate-duration-200" style={{ boxShadow: 'var(--rv-shadow-xl)' }}>

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 cursor-pointer transition-colors" style={{ color: 'var(--rv-text-muted)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--rv-text)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--rv-text-muted)'}>
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Title */}
        <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid var(--rv-border)' }}>
          <div className="p-2 rounded-xl flex items-center justify-center"
            style={{
              background: isDanger ? 'var(--rv-danger-bg)' : 'var(--rv-accent-glow)',
              border: isDanger ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(244,180,0,0.2)',
              color: isDanger ? 'var(--rv-danger)' : 'var(--rv-accent)'
            }}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--rv-text)' }}>{title}</h3>
          </div>
        </div>

        {/* Message */}
        <p className="text-[12px] leading-relaxed font-medium" style={{ color: 'var(--rv-text-secondary)' }}>
          {message}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button onClick={onClose} className="rv-btn rv-btn-secondary rv-btn-sm flex-1 cursor-pointer">
            {cancelText}
          </button>
          <button onClick={() => { onConfirm(); onClose(); }}
            className={`rv-btn rv-btn-sm flex-1 cursor-pointer ${isDanger ? 'rv-btn-danger' : 'rv-btn-primary'}`}>
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmationModal;
