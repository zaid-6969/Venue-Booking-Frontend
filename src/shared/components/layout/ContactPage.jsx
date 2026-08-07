/**
 * ContactPage Component
 *
 * Contact form & support inquiry page
 */

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'general', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Thank you! Your message has been received. Our team will contact you shortly.');
    setFormData({ name: '', email: '', subject: 'general', message: '' });
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-20)' }}>
      <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto var(--space-12)' }}>
        <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          Get in Touch
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', marginTop: 'var(--space-3)' }}>
          Have questions about venue listings, event planning, or partnership inquiries? We are here to help 24/7.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-10)' }}>
        {/* Contact Info Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-xl)', background: 'var(--brand-subtle)', color: 'var(--brand-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>Email Support</h4>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>support@venuehub.in</p>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-xl)', background: 'var(--brand-subtle)', color: 'var(--brand-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>Phone Toll-Free</h4>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>+91 1800 200 4567</p>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-xl)', background: 'var(--brand-subtle)', color: 'var(--brand-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>Headquarters</h4>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>Bandra Kurla Complex, Mumbai, Maharashtra 400051</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="card" style={{ padding: 'var(--space-8)', background: 'var(--surface-1)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>
                YOUR NAME
              </label>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>
                INQUIRY TYPE
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="input"
              >
                <option value="general">General Inquiry</option>
                <option value="booking">Booking Assistance</option>
                <option value="host">List Your Venue</option>
                <option value="partner">Corporate Partnership</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>
                MESSAGE
              </label>
              <textarea
                rows={4}
                placeholder="How can we help you?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="input"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ gap: 'var(--space-2)' }}>
              <Send size={18} /> Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
