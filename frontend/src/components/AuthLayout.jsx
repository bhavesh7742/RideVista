import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

/* ── Shared input styling helpers ─────────────────────────────── */
const inputStyle = {
  width: '100%', padding: '10px 14px', paddingLeft: 40,
  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--rv-border)',
  borderRadius: 'var(--rv-radius-md)', color: 'var(--rv-text)',
  fontSize: 13, transition: 'border-color 200ms ease, box-shadow 200ms ease', outline: 'none',
};
const focusIn = (e) => { e.target.style.borderColor = 'rgba(244,180,0,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(244,180,0,0.08)'; };
const focusOut = (e) => { e.target.style.borderColor = 'var(--rv-border)'; e.target.style.boxShadow = 'none'; };

/**
 * AuthLayout — shared wrapper for all login/register pages.
 * Props:
 *   badge: { icon: LucideIcon, text: string, variant?: 'accent'|'danger' }
 *   title: string
 *   subtitle: string
 *   error: string|null
 *   successMsg: string|null
 *   footer: ReactNode
 *   children: ReactNode (the form)
 */
const AuthLayout = ({ badge, title, subtitle, error, successMsg, footer, children }) => {
  const isDanger = badge?.variant === 'danger';
  const badgeBg = isDanger ? 'var(--rv-danger-bg)' : 'var(--rv-accent-glow)';
  const badgeBorder = isDanger ? 'rgba(248,113,113,0.15)' : 'rgba(244,180,0,0.15)';
  const badgeColor = isDanger ? 'var(--rv-danger)' : 'var(--rv-accent)';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative overflow-hidden py-12">
      {/* Ambient blobs */}
      <div className="rv-ambient-blob" style={{ width: 500, height: 500, top: '10%', left: '15%', background: 'radial-gradient(circle, rgba(244,180,0,0.05) 0%, transparent 70%)' }} />
      <div className="rv-ambient-blob" style={{ width: 400, height: 400, bottom: '10%', right: '15%', background: `radial-gradient(circle, ${isDanger ? 'rgba(248,113,113,0.03)' : 'rgba(59,130,246,0.03)'} 0%, transparent 70%)`, animationDelay: '2s' }} />

      <div className="w-full max-w-md rv-glass p-8 rv-animate-scaleIn" style={{ boxShadow: 'var(--rv-shadow-xl)' }}>
        {/* Header */}
        <div className="text-center mb-8">
          {badge && (
            <span className="rv-badge mb-4 inline-flex" style={{ background: badgeBg, border: `1px solid ${badgeBorder}`, color: badgeColor }}>
              {badge.icon && <badge.icon className="w-3.5 h-3.5" />} {badge.text}
            </span>
          )}
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--rv-text)' }}>{title}</h2>
          <p className="text-[13px] mt-2" style={{ color: 'var(--rv-text-muted)' }}>{subtitle}</p>
        </div>

        {/* Success message */}
        {successMsg && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl text-[13px] rv-animate-scaleIn"
            style={{ background: 'var(--rv-success-bg)', border: '1px solid rgba(52,211,153,0.15)', color: 'var(--rv-success)' }}>
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>{successMsg}</div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl text-[13px]"
            style={{ background: 'var(--rv-danger-bg)', border: '1px solid rgba(248,113,113,0.15)', color: 'var(--rv-danger)' }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div><span className="font-semibold">Error:</span> {error}</div>
          </div>
        )}

        {/* Form content */}
        {children}

        {/* Footer */}
        {footer && (
          <div className="mt-8 pt-6 text-center text-[13px]" style={{ borderTop: '1px solid var(--rv-border)', color: 'var(--rv-text-muted)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Reusable AuthField ───────────────────────────────────────── */
export const AuthField = ({ label, icon: Icon, type = 'text', required = true, value, onChange, placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-[12px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-[18px] w-[18px]" style={{ color: 'var(--rv-text-muted)' }} />
      </div>
      <input type={type} required={required} value={value} onChange={onChange} placeholder={placeholder}
        style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
    </div>
  </div>
);

/* ── Reusable AuthSubmit ──────────────────────────────────────── */
export const AuthSubmit = ({ isLoading, loadingText = 'Processing...', children }) => (
  <button type="submit" disabled={isLoading}
    className="w-full rv-btn rv-btn-primary rv-btn-lg cursor-pointer mt-6 flex items-center justify-center gap-2">
    {isLoading ? (
      <>
        <div className="rv-spinner flex-shrink-0" style={{ width: 14, height: 14, borderWidth: 2 }} />
        <span>{loadingText}</span>
      </>
    ) : (
      children
    )}
  </button>
);

export default AuthLayout;
