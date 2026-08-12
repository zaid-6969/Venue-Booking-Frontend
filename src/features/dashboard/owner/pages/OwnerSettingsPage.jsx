/**
 * OwnerSettingsPage Component
 *
 * Venue Owner Portal Application & Business Preferences:
 * - Account Settings (Language, Timezone)
 * - Notification Preferences (Email, SMS, Inquiry Alerts)
 * - Security & Authentication (Password Change, Session Security, 2FA status)
 * - Business Preferences (Default Currency, Invoice Tax Display)
 * - Booking Preferences (Lead Time, Auto-Response, Cancellation Policy)
 * - Privacy (Listing Contact Visibility)
 */

import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Settings, Bell, Shield, Lock, Sliders, Globe, Eye,
  Save, CheckCircle2, AlertTriangle, KeyRound
} from 'lucide-react';
import { selectCurrentUser } from '@features/auth/redux/authSlice';
import toast from 'react-hot-toast';

const OwnerSettingsPage = () => {
  const user = useSelector(selectCurrentUser);

  const [activeTab, setActiveTab] = useState('account');
  const [settings, setSettings] = useState({
    // Account
    language: 'English (IN)',
    timezone: 'Asia/Kolkata (IST +5:30)',

    // Notifications
    emailNewInquiry: true,
    emailBookingConfirm: true,
    emailReviewAlert: true,
    smsInstantAlert: false,

    // Security
    twoFactorAuth: false,

    // Business
    currency: 'INR (₹)',
    gstTaxMode: 'Inclusive of GST (18%)',

    // Booking
    minNoticeDays: '2',
    autoAcceptInquiries: false,
    cancellationPolicy: 'Moderate (Full refund up to 7 days before event)',

    // Privacy
    showOwnerPhoneOnVenue: true,
    allowDirectMessaging: true,
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Owner settings and preferences updated!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 900, paddingBottom: 40 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)' }}>Venue Hub Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
          Manage your owner account notifications, security controls, and venue booking preferences
        </p>
      </div>

      {/* Tabs Bar */}
      <div style={{
        display: 'flex', gap: 6, background: 'var(--surface-1)', padding: 6,
        borderRadius: 16, border: '1px solid var(--border-subtle)', flexWrap: 'wrap'
      }}>
        {[
          { id: 'account', label: 'Account', icon: Settings },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'security', label: 'Security & Password', icon: Lock },
          { id: 'business', label: 'Business & Booking', icon: Sliders },
          { id: 'privacy', label: 'Privacy', icon: Eye },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                borderRadius: 12, border: 'none',
                background: isActive ? '#6344f5' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500, fontSize: 13, cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* SECTION: Account Preferences */}
        {activeTab === 'account' && (
          <div className="card" style={{ padding: 24, background: 'var(--surface-1)', borderRadius: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={18} style={{ color: '#6344f5' }} /> System Language & Localization
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Portal Language</label>
                <select name="language" value={settings.language} onChange={handleChange} className="input">
                  <option value="English (IN)">English (India)</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Marathi">Marathi (मराठी)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Timezone</label>
                <select name="timezone" value={settings.timezone} onChange={handleChange} className="input">
                  <option value="Asia/Kolkata (IST +5:30)">Asia/Kolkata (IST +5:30)</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: Notifications */}
        {activeTab === 'notifications' && (
          <div className="card" style={{ padding: 24, background: 'var(--surface-1)', borderRadius: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={18} style={{ color: '#6344f5' }} /> Email & Alert Channels
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { key: 'emailNewInquiry', label: 'Email Alerts for New Inquiries', desc: 'Receive immediate email notifications whenever a customer requests a date.' },
                { key: 'emailBookingConfirm', label: 'Email Alerts for Confirmed Payments', desc: 'Get notified when customers complete advance payment for accepted slots.' },
                { key: 'emailReviewAlert', label: 'Email Notifications for Guest Reviews', desc: 'Receive instant notifications when guests post ratings after completed events.' },
                { key: 'smsInstantAlert', label: 'SMS Instant Mobile Alerts', desc: 'Send urgent SMS notifications to registered phone (+91 98765 43210).' },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: 'var(--bg-subtle)', borderRadius: 14 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{item.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings[item.key]}
                    onChange={() => handleToggle(item.key)}
                    style={{ width: 20, height: 20, accentColor: '#6344f5', cursor: 'pointer' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: Security */}
        {activeTab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ padding: 24, background: 'var(--surface-1)', borderRadius: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <KeyRound size={18} style={{ color: '#6344f5' }} /> Change Password
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Current Password</label>
                  <input type="password" placeholder="••••••••" className="input" />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>New Password</label>
                  <input type="password" placeholder="••••••••" className="input" />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="input" />
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 24, background: 'var(--surface-1)', borderRadius: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Two-Factor Authentication (2FA)</h4>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>Add an extra layer of security to protect your owner portal access.</p>
              </div>
              <span className="badge badge-warning">Standard Security</span>
            </div>
          </div>
        )}

        {/* SECTION: Business & Booking Preferences */}
        {activeTab === 'business' && (
          <div className="card" style={{ padding: 24, background: 'var(--surface-1)', borderRadius: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sliders size={18} style={{ color: '#6344f5' }} /> Booking & Availability Rules
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Minimum Advance Notice Days</label>
                <select name="minNoticeDays" value={settings.minNoticeDays} onChange={handleChange} className="input">
                  <option value="1">1 Day Notice</option>
                  <option value="2">2 Days Notice (Recommended)</option>
                  <option value="7">7 Days Notice</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Default Cancellation Policy</label>
                <select name="cancellationPolicy" value={settings.cancellationPolicy} onChange={handleChange} className="input">
                  <option value="Flexible (Full refund up to 24 hours before event)">Flexible (Full refund up to 24h before event)</option>
                  <option value="Moderate (Full refund up to 7 days before event)">Moderate (Full refund up to 7 days before event)</option>
                  <option value="Strict (50% refund up to 14 days before event)">Strict (50% refund up to 14 days before event)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: Privacy */}
        {activeTab === 'privacy' && (
          <div className="card" style={{ padding: 24, background: 'var(--surface-1)', borderRadius: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Eye size={18} style={{ color: '#6344f5' }} /> Public Contact & Listing Privacy
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: 'var(--bg-subtle)', borderRadius: 14 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Display Contact Phone Number on Public Venue Page</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>Allow prospective customers to see phone number directly on venue details.</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showOwnerPhoneOnVenue}
                  onChange={() => handleToggle('showOwnerPhoneOnVenue')}
                  style={{ width: 20, height: 20, accentColor: '#6344f5', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary" style={{ width: 'fit-content', gap: 8, padding: '12px 24px', borderRadius: 14, background: '#6344f5' }}>
          <Save size={18} /> Save Settings & Preferences
        </button>

      </form>
    </div>
  );
};

export default OwnerSettingsPage;
