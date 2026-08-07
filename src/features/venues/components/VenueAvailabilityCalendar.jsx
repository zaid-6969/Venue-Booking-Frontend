/**
 * VenueAvailabilityCalendar Component
 *
 * Lightweight, high-performance interactive availability calendar component:
 * - Displays monthly grid with live date status indicators (Available, Booked, Pending, Blocked)
 * - Navigation: Previous & Next Month controls
 * - Interactive Selection: Clicking an available date selects it for venue booking
 * - Fully responsive & zero external calendar library dependency issues
 */

import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Lock, Clock, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const VenueAvailabilityCalendar = ({ availability = [], selectedDate, onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of current month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Helper to format date string YYYY-MM-DD
  const formatDateString = (y, m, d) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const todayStr = formatDateString(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  const handleCellClick = (dateStr, status) => {
    if (dateStr < todayStr) {
      toast.error('Cannot select a past date for event booking.');
      return;
    }

    if (status === 'booked' || status === 'blocked' || status === 'maintenance') {
      toast.error(`Date ${dateStr} is currently ${status} and unavailable.`);
      return;
    }

    if (status === 'pending') {
      toast('Date is awaiting owner confirmation. You may select it as a backup slot.', { icon: '⏳' });
    }

    if (onSelectDate) {
      onSelectDate(dateStr);
      toast.success(`Selected Event Date: ${dateStr}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Calendar Header Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-subtle)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-xl)' }}>
        <button
          type="button"
          onClick={handlePrevMonth}
          className="btn btn-secondary btn-sm"
          style={{ gap: 4 }}
        >
          <ChevronLeft size={16} /> Prev
        </button>

        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          {MONTH_NAMES[month]} {year}
        </h3>

        <button
          type="button"
          onClick={handleNextMonth}
          className="btn btn-secondary btn-sm"
          style={{ gap: 4 }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday Grid Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center' }}>
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--text-tertiary)', padding: '6px 0', textTransform: 'uppercase' }}>
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {/* Empty padding cells for first week */}
        {[...Array(firstDayOfMonth)].map((_, i) => (
          <div key={`empty-${i}`} style={{ height: 64, borderRadius: 'var(--radius-lg)', background: 'transparent' }} />
        ))}

        {/* Month Day Cells */}
        {[...Array(daysInMonth)].map((_, index) => {
          const dayNum = index + 1;
          const dateStr = formatDateString(year, month, dayNum);

          // Find availability rule for this date
          const rule = availability.find((a) => {
            if (!a.date) return false;
            const aDateStr = new Date(a.date).toISOString().split('T')[0];
            return aDateStr === dateStr;
          });

          const isPast = dateStr < todayStr;
          const status = isPast ? 'past' : rule ? rule.status : 'available';
          const isSelected = selectedDate === dateStr;

          // Status Style Mapping
          let bg = 'var(--surface-1)';
          let border = '1px solid var(--border-subtle)';
          let textColor = 'var(--text-primary)';
          let badgeText = '';

          if (isPast) {
            bg = 'var(--bg-subtle)';
            textColor = 'var(--text-tertiary)';
          } else if (isSelected) {
            bg = 'var(--brand-subtle)';
            border = '2px solid var(--brand-default)';
            textColor = 'var(--brand-default)';
            badgeText = 'Selected';
          } else if (status === 'booked') {
            bg = 'rgba(239, 68, 68, 0.12)';
            border = '1px solid rgba(239, 68, 68, 0.4)';
            textColor = '#dc2626';
            badgeText = 'Booked';
          } else if (status === 'pending') {
            bg = 'rgba(245, 158, 11, 0.12)';
            border = '1px solid rgba(245, 158, 11, 0.4)';
            textColor = '#d97706';
            badgeText = 'Pending';
          } else if (status === 'blocked' || status === 'maintenance') {
            bg = 'var(--bg-subtle)';
            border = '1px solid var(--border-normal)';
            textColor = 'var(--text-tertiary)';
            badgeText = 'Blocked';
          } else {
            // Available
            bg = 'rgba(34, 197, 94, 0.08)';
            border = '1px solid rgba(34, 197, 94, 0.3)';
            textColor = '#16a34a';
            badgeText = 'Available';
          }

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isPast || status === 'booked' || status === 'blocked'}
              onClick={() => handleCellClick(dateStr, status)}
              style={{
                height: 68,
                borderRadius: 'var(--radius-xl)',
                background: bg,
                border,
                color: textColor,
                padding: '6px 8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                cursor: isPast || status === 'booked' || status === 'blocked' ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
                opacity: isPast ? 0.5 : 1,
              }}
            >
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 800 }}>
                {dayNum}
              </span>

              {badgeText && (
                <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                  {badgeText}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VenueAvailabilityCalendar;
