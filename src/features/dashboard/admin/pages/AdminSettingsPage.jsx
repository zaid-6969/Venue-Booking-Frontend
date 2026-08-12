/**
 * AdminSettingsPage Component
 *
 * System configuration parameters for Platform Administrators
 */

import { useState } from 'react';
import { Settings, Save, Shield, Percent, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettingsPage = () => {
  const [commissionRate, setCommissionRate] = useState(10);
  const [gstRate, setGstRate] = useState(18);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('System settings saved successfully');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 680 }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Platform Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
          Configure system commission rates, taxes, and operational settings
        </p>
      </div>

      <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>
              PLATFORM COMMISSION FEE RATE (%)
            </label>
            <input
              type="number"
              value={commissionRate}
              onChange={(e) => setCommissionRate(Number(e.target.value))}
              className="input"
              min={0}
              max={50}
              required
            />
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: 4, display: 'block' }}>
              Percentage fee retained by EventFlow on every successful venue booking.
            </span>
          </div>

          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>
              DEFAULT GST TAX RATE (%)
            </label>
            <input
              type="number"
              value={gstRate}
              onChange={(e) => setGstRate(Number(e.target.value))}
              className="input"
              min={0}
              max={28}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>System Maintenance Mode</h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Temporarily restrict new bookings during maintenance windows.</p>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              style={{ width: 20, height: 20, accentColor: 'var(--brand-default)', cursor: 'pointer' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', gap: 'var(--space-2)' }}>
            <Save size={16} /> Save Configuration
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
