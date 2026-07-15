import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { hideToast } from '../features/notificationSlice';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContainer = () => {
  const dispatch = useDispatch();
  const toasts = useSelector((state) => state.notification?.toasts || []);

  const handleClose = (id) => {
    dispatch(hideToast(id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[60] space-y-3 pointer-events-none" style={{ maxWidth: 400 }}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={handleClose} />
      ))}
    </div>
  );
};

const TOAST_DURATION = 4000;

const ToastItem = ({ toast, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const config = {
    success: {
      bg: 'rgba(16, 185, 129, 0.08)',
      border: 'rgba(52, 211, 153, 0.2)',
      text: 'var(--rv-success)',
      progressColor: 'var(--rv-success)',
      icon: CheckCircle2,
    },
    error: {
      bg: 'rgba(248, 113, 113, 0.08)',
      border: 'rgba(248, 113, 113, 0.2)',
      text: 'var(--rv-danger)',
      progressColor: 'var(--rv-danger)',
      icon: AlertCircle,
    },
    warning: {
      bg: 'rgba(251, 191, 36, 0.08)',
      border: 'rgba(251, 191, 36, 0.2)',
      text: 'var(--rv-warning)',
      progressColor: 'var(--rv-warning)',
      icon: AlertCircle,
    },
    info: {
      bg: 'var(--rv-surface)',
      border: 'var(--rv-border)',
      text: 'var(--rv-accent)',
      progressColor: 'var(--rv-accent)',
      icon: Info,
    },
  };

  const style = config[toast.type] || config.info;
  const Icon = style.icon;

  return (
    <div
      className="pointer-events-auto rounded-xl overflow-hidden rv-animate-slideRight"
      style={{
        background: style.bg,
        backdropFilter: 'blur(16px)',
        border: `1px solid ${style.border}`,
        boxShadow: 'var(--rv-shadow-lg)',
      }}
    >
      {/* Content */}
      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <Icon className="w-[18px] h-[18px] flex-shrink-0" style={{ color: style.text }} />
          <span className="text-[13px] font-medium leading-snug" style={{ color: style.text }}>
            {toast.message}
          </span>
        </div>
        <button
          onClick={() => onClose(toast.id)}
          className="p-1 rounded-md transition-all duration-200 cursor-pointer flex-shrink-0"
          style={{ color: style.text, opacity: 0.6 }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Auto-dismiss progress bar */}
      <div className="h-[2px] w-full" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div
          className="h-full rounded-full"
          style={{
            background: style.progressColor,
            opacity: 0.6,
            animation: `rv-progress ${TOAST_DURATION}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
};

export default ToastContainer;
