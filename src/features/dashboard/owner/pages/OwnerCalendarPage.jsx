/**
 * OwnerCalendarPage Component
 *
 * Enterprise Availability & Rates Calendar with FullCalendar:
 * - Views: Month, Week, Day, List/Agenda
 * - Color Legends: Green (Available), Red (Booked), Yellow (Pending), Gray (Maintenance), Purple (Holiday), Black (Blocked)
 * - Interactive Date Click: Set date availability status & custom notes
 * - Syncs with MongoDB venue.availability array
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import VenueAvailabilityCalendar from '@features/venues/components/VenueAvailabilityCalendar';

import { fetchMyVenues, updateVenueAvailability } from '@features/venues/redux/venuesThunks';
import { selectMyVenues } from '@features/venues/redux/venuesSlice';
import { fetchOwnerBookings, selectOwnerBookings } from '@features/bookings/redux/bookingsSlice';
import toast from 'react-hot-toast';
import { Calendar as CalendarIcon, CheckCircle2, Shield, AlertCircle, X } from 'lucide-react';

const STATUS_COLORS = {
  available:   '#22c55e', // Green
  booked:      '#ef4444', // Red
  pending:     '#f59e0b', // Yellow
  maintenance: '#6b7280', // Gray
  holiday:     '#8b5cf6', // Purple
  blocked:     '#111827', // Black
};

const OwnerCalendarPage = () => {
  const dispatch = useDispatch();
  const myVenues = useSelector(selectMyVenues);
  const bookings = useSelector(selectOwnerBookings);

  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [modalDate, setModalDate] = useState(null);
  const [modalStatus, setModalStatus] = useState('available');
  const [modalReason, setModalReason] = useState('');

  useEffect(() => {
    dispatch(fetchMyVenues());
    dispatch(fetchOwnerBookings());
  }, [dispatch]);

  useEffect(() => {
    if (myVenues.length > 0 && !selectedVenueId) {
      setSelectedVenueId(myVenues[0]._id);
    }
  }, [myVenues, selectedVenueId]);

  const activeVenue = myVenues.find(v => v._id === selectedVenueId) || myVenues[0];

  // Map venue availability rules + booking dates to FullCalendar events
  const bookingEvents = (bookings || [])
    .filter(b => !selectedVenueId || b.venue?._id === selectedVenueId || b.venue === selectedVenueId)
    .map(b => ({
      id: `booking-${b._id}`,
      title: `Booked: ${b.customer?.name || 'Customer'} (${b.bookingReference || 'Ref'})`,
      date: b.eventDate ? b.eventDate.split('T')[0] : '',
      color: b.bookingStatus === 'confirmed' ? STATUS_COLORS.booked : b.bookingStatus === 'pending' ? STATUS_COLORS.pending : STATUS_COLORS.blocked,
    }));

  const ruleEvents = (activeVenue?.availability || []).map((rule, idx) => ({
    id: `rule-${idx}`,
    title: `${rule.status.toUpperCase()}: ${rule.reason || rule.status}`,
    date: rule.date ? new Date(rule.date).toISOString().split('T')[0] : '',
    color: STATUS_COLORS[rule.status] || STATUS_COLORS.blocked,
  }));

  const calendarEvents = [...bookingEvents, ...ruleEvents];

  const handleDateClick = (info) => {
    setModalDate(info.dateStr);
    setModalStatus('blocked');
    setModalReason('');
  };

  const handleSaveDateRule = async (e) => {
    e.preventDefault();
    if (!activeVenue || !modalDate) return;

    const existingRules = activeVenue.availability || [];
    const newRule = { date: modalDate, status: modalStatus, reason: modalReason };

    const updatedRules = [
      ...existingRules.filter(r => new Date(r.date).toISOString().split('T')[0] !== modalDate),
      newRule,
    ];

    try {
      await dispatch(updateVenueAvailability({ id: activeVenue._id, availability: updatedRules })).unwrap();
      toast.success(`Date ${modalDate} updated to ${modalStatus}!`);
      setModalDate(null);
    } catch {
      toast.error('Failed to update availability date');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header & Venue Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Availability Calendar</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Manage dates, block maintenance days, and set seasonal availability rules
          </p>
        </div>

        {myVenues.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)' }}>Select Venue:</span>
            <select
              value={selectedVenueId}
              onChange={(e) => setSelectedVenueId(e.target.value)}
              className="input"
              style={{ width: 'auto', minWidth: 220 }}
            >
              {myVenues.map(v => (
                <option key={v._id} value={v._id}>{v.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Color Legend Bar */}
      <div className="card" style={{ padding: 'var(--space-4)', background: 'var(--surface-1)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Legend:</span>
        {Object.entries(STATUS_COLORS).map(([st, col]) => (
          <div key={st} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', fontWeight: 600 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: col, display: 'inline-block' }} />
            <span style={{ textTransform: 'capitalize' }}>{st}</span>
          </div>
        ))}
      </div>

      {/* Interactive Availability Calendar */}
      <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
        <VenueAvailabilityCalendar
          availability={activeVenue?.availability || []}
          onSelectDate={(dateStr) => {
            setModalDate(dateStr);
            const existing = activeVenue?.availability?.find(a => new Date(a.date).toISOString().split('T')[0] === dateStr);
            setModalStatus(existing?.status || 'available');
            setModalReason(existing?.reason || '');
          }}
        />
      </div>

      {/* Date Status Modal */}
      {modalDate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="card glass" style={{ width: '100%', maxWidth: 440, padding: 'var(--space-6)', background: 'var(--surface-1)', borderRadius: 'var(--radius-2xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Update Date: {modalDate}</h3>
              <button onClick={() => setModalDate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveDateRule} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Availability Status</label>
                <select value={modalStatus} onChange={(e) => setModalStatus(e.target.value)} className="input">
                  <option value="available">Available (Green)</option>
                  <option value="booked">Booked (Red)</option>
                  <option value="pending">Pending Booking (Yellow)</option>
                  <option value="maintenance">Maintenance (Gray)</option>
                  <option value="holiday">Holiday Surcharge (Purple)</option>
                  <option value="blocked">Blocked Date (Black)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Note / Reason (Optional)</label>
                <input type="text" value={modalReason} onChange={(e) => setModalReason(e.target.value)} className="input" placeholder="e.g. Hall Renovation / Private Function" />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Date Status</button>
                <button type="button" onClick={() => setModalDate(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerCalendarPage;
