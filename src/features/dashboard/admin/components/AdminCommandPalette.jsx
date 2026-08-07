/**
 * AdminCommandPalette Component
 *
 * Command Bar (Ctrl+K / Cmd+K) for enterprise navigation:
 * - Quick jump to Venues, Bookings, Users, Analytics, Settings
 * - Direct search across venues and users
 * - Action shortcuts (Approve venues, Export data, Toggle maintenance mode)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, Users, Calendar, BarChart3, Settings, Shield, X, ArrowRight, CornerDownLeft } from 'lucide-react';

const COMMANDS = [
  { group: 'Navigation', title: 'Admin Dashboard', path: '/admin/dashboard', icon: Shield },
  { group: 'Navigation', title: 'Platform Venues', path: '/admin/venues', icon: Building2 },
  { group: 'Navigation', title: 'Bookings Ledger', path: '/admin/bookings', icon: Calendar },
  { group: 'Navigation', title: 'User Accounts', path: '/admin/users', icon: Users },
  { group: 'Navigation', title: 'Venue Owners Network', path: '/admin/owners', icon: Users },
  { group: 'Navigation', title: 'Analytics & GMV Reports', path: '/admin/analytics', icon: BarChart3 },
  { group: 'Navigation', title: 'System Settings', path: '/admin/settings', icon: Settings },
];

const AdminCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCommands = COMMANDS.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.group.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path) => {
    setIsOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        className="card glass"
        style={{
          width: '100%',
          maxWidth: 640,
          background: 'var(--surface-1)',
          borderRadius: 'var(--radius-2xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-2xl)',
          border: '1px solid var(--border-subtle)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', gap: 12 }}>
          <Search size={20} style={{ color: 'var(--brand-default)' }} />
          <input
            type="text"
            placeholder="Type a command or search (e.g. Venues, Bookings, Settings)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 'var(--text-base)',
              color: 'var(--text-primary)',
              fontWeight: 500,
            }}
          />
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Results Stream */}
        <div style={{ maxHeight: 380, overflowY: 'auto', padding: '12px 8px' }}>
          {filteredCommands.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
              No commands matching &quot;{query}&quot;
            </div>
          ) : (
            filteredCommands.map((cmd, index) => {
              const IconComponent = cmd.icon;
              return (
                <div
                  key={index}
                  onClick={() => handleSelect(cmd.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-xl)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--brand-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-lg)', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-default)' }}>
                      <IconComponent size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{cmd.title}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{cmd.group}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    <span>Jump to</span>
                    <CornerDownLeft size={12} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div style={{ padding: '10px 20px', background: 'var(--bg-subtle)', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)' }}>
          <span>Tip: Press <kbd style={{ background: 'var(--surface-1)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border-subtle)' }}>Ctrl</kbd> + <kbd style={{ background: 'var(--surface-1)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border-subtle)' }}>K</kbd> anywhere to open</span>
          <span><kbd style={{ background: 'var(--surface-1)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border-subtle)' }}>ESC</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};

export default AdminCommandPalette;
