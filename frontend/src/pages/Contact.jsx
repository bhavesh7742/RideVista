import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle, HelpCircle } from 'lucide-react';

const inputStyle = {
  width: '100%', padding: '10px 14px',
  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--rv-border)',
  borderRadius: 'var(--rv-radius-md)', color: 'var(--rv-text)',
  fontSize: 13, transition: 'border-color 200ms ease, box-shadow 200ms ease', outline: 'none',
};
const focusIn = (e) => { e.target.style.borderColor = 'rgba(244,180,0,0.35)'; e.target.style.boxShadow = '0 0 0 3px rgba(244,180,0,0.06)'; };
const focusOut = (e) => { e.target.style.borderColor = 'var(--rv-border)'; e.target.style.boxShadow = 'none'; };

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setName(''); setEmail(''); setMessage('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8" style={{ color: 'var(--rv-text)' }}>
      <div className="max-w-5xl mx-auto space-y-12">

        <div className="text-center space-y-3 rv-animate-fadeUp">
          <span className="rv-badge rv-badge-accent">Help Desk</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--rv-text)' }}>Contact RideVista Support</h1>
          <p className="max-w-xl mx-auto text-sm" style={{ color: 'var(--rv-text-secondary)' }}>
            Have questions about document verification, pilot registrations or listings? Send us a message!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

          {/* Info Card */}
          <div className="rv-card-static p-7 sm:p-8 space-y-6 rv-animate-fadeUp rv-delay-1">
            <h3 className="text-lg font-bold" style={{ color: 'var(--rv-text)' }}>Connect Instantly</h3>

            <div className="space-y-5 text-[13px]">
              {[
                { icon: Phone, title: 'Call Agency Operations', line1: '+91 9001122334', line2: '9:00 AM - 8:00 PM (Monday - Saturday)' },
                { icon: Mail, title: 'Email Desk', line1: 'support@ridevista.com' },
                { icon: MapPin, title: 'Central Verification Office', line1: '102, Heritage Tower, Circuit House Road, Jodhpur, Rajasthan' },
              ].map(({ icon: Ic, title, line1, line2 }) => (
                <div key={title} className="flex items-start gap-3">
                  <Ic className="w-[18px] h-[18px] flex-shrink-0 mt-0.5" style={{ color: 'var(--rv-accent)' }} />
                  <div>
                    <p className="font-bold text-[13px]" style={{ color: 'var(--rv-text)' }}>{title}</p>
                    <p style={{ color: 'var(--rv-text-secondary)' }}>{line1}</p>
                    {line2 && <p className="text-[11px]" style={{ color: 'var(--rv-text-muted)' }}>{line2}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className="rv-card-static p-4 space-y-2">
              <p className="font-bold text-[12px] flex items-center gap-1.5" style={{ color: 'var(--rv-text)' }}>
                <HelpCircle className="w-4 h-4" style={{ color: 'var(--rv-accent)' }} /> Need Help Planning?
              </p>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--rv-text-muted)' }}>
                Log in as a tourist to consult our AI Travel Assistant, which automatically scans all available local fleets in your destination city.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="rv-glass p-7 sm:p-8 rv-animate-fadeUp rv-delay-2" style={{ boxShadow: 'var(--rv-shadow-lg)' }}>
            {submitted && (
              <div className="mb-6 flex items-center gap-2 p-4 rounded-xl text-[13px] rv-animate-scaleIn"
                style={{ background: 'var(--rv-success-bg)', border: '1px solid rgba(52,211,153,0.15)', color: 'var(--rv-success)' }}>
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                Thank you! Your message has been received. Our team will respond shortly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold block mb-1.5" style={{ color: 'var(--rv-text-secondary)' }}>Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name"
                  style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </div>
              <div>
                <label className="text-[11px] font-semibold block mb-1.5" style={{ color: 'var(--rv-text-secondary)' }}>Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com"
                  style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </div>
              <div>
                <label className="text-[11px] font-semibold block mb-1.5" style={{ color: 'var(--rv-text-secondary)' }}>Message</label>
                <textarea rows={4} required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your query here..."
                  style={{ ...inputStyle, resize: 'none' }} onFocus={focusIn} onBlur={focusOut} />
              </div>
              <button type="submit" className="w-full rv-btn rv-btn-primary rv-btn-lg cursor-pointer">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
