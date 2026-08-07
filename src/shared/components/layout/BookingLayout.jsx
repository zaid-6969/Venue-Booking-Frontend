/**
 * BookingLayout — Multi-step booking flow layout
 * Shows progress indicator and step navigation
 */
import { Outlet, Link, useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { APP_NAME } from '@constants/index';

const STEPS = [
  { id: 1, label: 'Booking Details', path: '' },
  { id: 2, label: 'Payment',         path: '/payment' },
  { id: 3, label: 'Confirmation',    path: '/confirm' },
];

const BookingLayout = () => {
  const { venueId } = useParams();
  const currentPath = window.location.pathname;

  const getCurrentStep = () => {
    if (currentPath.includes('/confirm')) return 3;
    if (currentPath.includes('/payment')) return 2;
    return 1;
  };

  const currentStep = getCurrentStep();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-subtle)', display: 'flex', flexDirection: 'column' }}>
      {/* Booking Header */}
      <header style={{
        background: 'var(--surface-1)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: 'var(--space-4) var(--space-8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 'var(--radius-md)',
            background: 'var(--brand-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800,
          }}>V</div>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {APP_NAME}
          </span>
        </Link>

        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {STEPS.map((step, index) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div style={{
                width: 28, height: 28,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                background: currentStep > step.id
                  ? 'var(--color-success-500)'
                  : currentStep === step.id
                    ? 'var(--brand-default)'
                    : 'var(--bg-muted)',
                color: currentStep >= step.id ? '#fff' : 'var(--text-tertiary)',
                transition: 'all var(--transition-normal)',
              }}>
                {currentStep > step.id ? <CheckCircle size={14} /> : step.id}
              </div>
              <span style={{
                fontSize: 'var(--text-xs)',
                fontWeight: currentStep === step.id ? 600 : 400,
                color: currentStep === step.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
                display: window.innerWidth < 640 ? 'none' : 'block',
              }}>
                {step.label}
              </span>
              {index < STEPS.length - 1 && (
                <div style={{
                  width: 32, height: 1,
                  background: currentStep > step.id ? 'var(--color-success-500)' : 'var(--border-normal)',
                  transition: 'background var(--transition-normal)',
                }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ width: 120 }} /> {/* Spacer for centering */}
      </header>

      {/* Content */}
      <main style={{ flex: 1, padding: 'var(--space-8) var(--space-6)', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default BookingLayout;
