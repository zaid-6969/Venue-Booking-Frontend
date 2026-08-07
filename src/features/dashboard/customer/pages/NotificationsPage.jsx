/**
 * NotificationsPage Component — Full Notification Management Center
 *
 * Features:
 * - Category filter tabs (All, Unread, Bookings, Reminders, Payments)
 * - On-demand "Run Background Cron Job Now" manual trigger button
 * - Mark as Read, Mark All as Read, Delete individual, Clear All
 * - Interactive navigation link to bookings/venues
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  Clock,
  DollarSign,
  Star,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Check
} from 'lucide-react';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  triggerCronJob,
  selectNotifications,
  selectUnreadCount
} from '@features/notifications/redux/notificationsSlice';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);

  const [activeTab, setActiveTab] = useState('all');
  const [isCronRunning, setIsCronRunning] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkRead = (e, id) => {
    e.stopPropagation();
    dispatch(markNotificationRead(id));
  };

  const handleMarkAll = () => {
    dispatch(markAllNotificationsRead());
    toast.success('All notifications marked as read');
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    dispatch(deleteNotification(id));
    toast.success('Notification deleted');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      dispatch(clearAllNotifications());
      toast.success('All notifications cleared');
    }
  };

  const handleRunCron = async () => {
    setIsCronRunning(true);
    try {
      const res = await dispatch(triggerCronJob()).unwrap();
      const summary = res?.data || res || {};
      toast.success(
        `Background Cron Completed: ${summary.remindersSent || 0} reminders sent, ${summary.completedEventsProcessed || 0} events completed.`
      );
      dispatch(fetchNotifications());
    } catch {
      toast.error('Failed to run background cron job');
    } finally {
      setIsCronRunning(false);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      dispatch(markNotificationRead(notif._id));
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  // Filtering
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'bookings') return n.type === 'booking';
    if (activeTab === 'reminders') return n.type === 'system' || n.title?.toLowerCase().includes('reminder');
    if (activeTab === 'payments') return n.type === 'payment';
    return true;
  });

  const getNotifIcon = (type, title = '') => {
    const titleLower = title.toLowerCase();
    if (type === 'payment' || titleLower.includes('payment')) return <DollarSign size={18} style={{ color: 'var(--color-success-700)' }} />;
    if (titleLower.includes('reminder') || titleLower.includes('alert')) return <Clock size={18} style={{ color: 'var(--color-warning-700)' }} />;
    if (type === 'review' || titleLower.includes('review')) return <Star size={18} style={{ color: 'var(--color-purple-700)' }} />;
    if (type === 'booking') return <Calendar size={18} style={{ color: 'var(--brand-default)' }} />;
    return <Bell size={18} style={{ color: 'var(--color-info-700)' }} />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 850, margin: '0 auto' }}>
      
      {/* Header Banner */}
      <div className="card glass" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-3xl)', background: 'linear-gradient(135deg, var(--surface-1) 0%, var(--brand-subtle) 100%)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--brand-default)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Notification Center</span>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
              Activity Updates ({unreadCount} Unread)
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
              Automated reminders, booking updates, payment receipts, and venue activity alerts.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <button
              onClick={handleRunCron}
              disabled={isCronRunning}
              className="btn btn-primary btn-sm"
              style={{ gap: 'var(--space-2)' }}
              title="Manually execute background cron scheduler for upcoming event reminders & completed events"
            >
              <RefreshCw size={15} className={isCronRunning ? 'spin' : ''} />
              {isCronRunning ? 'Running Cron...' : 'Run Background Cron Now'}
            </button>

            {unreadCount > 0 && (
              <button onClick={handleMarkAll} className="btn btn-secondary btn-sm" style={{ gap: 'var(--space-2)' }}>
                <CheckCheck size={15} /> Mark All Read
              </button>
            )}

            {notifications.length > 0 && (
              <button onClick={handleClearAll} className="btn btn-secondary btn-sm" style={{ color: 'var(--color-error-500)', gap: 'var(--space-2)' }}>
                <Trash2 size={15} /> Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { id: 'all', label: `All (${notifications.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'bookings', label: 'Bookings' },
          { id: 'reminders', label: 'Reminders & Alerts' },
          { id: 'payments', label: 'Payments' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-16)', textAlign: 'center', background: 'var(--surface-1)' }}>
          <Bell size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto var(--space-4) auto' }} />
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>No Notifications Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, marginBottom: 'var(--space-6)' }}>
            {activeTab === 'unread' ? 'You have read all your notifications!' : 'Background automated cron notifications will appear here.'}
          </p>
          <button onClick={handleRunCron} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
            <RefreshCw size={14} /> Run Background Cron Check
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              className="card glass"
              onClick={() => handleNotificationClick(notif)}
              style={{
                padding: 'var(--space-5)',
                background: notif.isRead ? 'var(--surface-1)' : 'var(--brand-subtle)',
                borderLeft: notif.isRead ? '4px solid var(--border-subtle)' : '4px solid var(--brand-default)',
                cursor: notif.link ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-4)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {/* Icon */}
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-xl)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {getNotifIcon(notif.type, notif.title)}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {notif.title}
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                    {new Date(notif.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                  {notif.message}
                </p>

                {notif.link && (
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-default)', marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    View Related Page <ExternalLink size={12} />
                  </div>
                )}
              </div>

              {/* Individual Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {!notif.isRead && (
                  <button
                    onClick={(e) => handleMarkRead(e, notif._id)}
                    title="Mark as read"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-default)', padding: 6 }}
                  >
                    <Check size={16} />
                  </button>
                )}
                <button
                  onClick={(e) => handleDelete(e, notif._id)}
                  title="Delete notification"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 6 }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default NotificationsPage;
