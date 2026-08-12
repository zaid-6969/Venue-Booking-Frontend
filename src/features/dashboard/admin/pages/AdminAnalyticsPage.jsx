/**
 * AdminAnalyticsPage Component — Enterprise SaaS Super Admin Analytics
 *
 * Real MongoDB aggregated platform metrics, date range filtering,
 * interactive SVG charts, revenue trends, booking distributions, platform growth,
 * top performing venues table, recent activity feed, dynamic insights, and CSV export.
 */

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  Building2,
  Users,
  CalendarCheck,
  BarChart3,
  PieChart,
  MapPin,
  RefreshCw,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Award,
  Sparkles,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';

import adminService from '../services/adminService';

const DATE_RANGES = [
  { id: 'today', label: 'Today' },
  { id: '7d',    label: '7 Days' },
  { id: '30d',   label: '30 Days' },
  { id: '90d',   label: '90 Days' },
  { id: 'year',  label: 'This Year' },
  { id: 'custom',label: 'Custom Range' },
];

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(val) || 0);
};

const formatCompactNumber = (val) => {
  const num = Number(val) || 0;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
  return `₹${num.toLocaleString('en-IN')}`;
};

const AdminAnalyticsPage = () => {
  const navigate = useNavigate();

  const [range, setRange] = useState('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Tooltip states for charts
  const [activeRevenueHover, setActiveRevenueHover] = useState(null);
  const [activeActivityHover, setActiveActivityHover] = useState(null);
  const [activeGrowthHover, setActiveGrowthHover] = useState(null);
  const [activeDonutHover, setActiveDonutHover] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        range,
        startDate: range === 'custom' && customStart ? customStart : undefined,
        endDate: range === 'custom' && customEnd ? customEnd : undefined,
      };

      const res = await adminService.getAnalytics(params);
      if (res?.data) {
        setAnalytics(res.data);
      } else {
        throw new Error('Empty response received from analytics API');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to load platform analytics.');
      toast.error('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  }, [range, customStart, customEnd]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // CSV Export Utility
  const handleExportCSV = () => {
    if (!analytics) {
      toast.error('No analytics data available to export');
      return;
    }

    try {
      const { kpis, topVenues, revenueTimeline, dateRange } = analytics;

      let csv = `EventFlow Platform Analytics Report (${dateRange?.label || range})\n\n`;

      // 1. KPI Summary
      csv += `KEY PERFORMANCE INDICATORS\n`;
      csv += `Metric,Value,Previous Period Comparison\n`;
      csv += `Total Revenue,"${formatCurrency(kpis?.totalRevenue?.value || 0)}","${kpis?.totalRevenue?.hasComparison ? `${kpis?.totalRevenue?.isPositive ? '+' : '-'}${kpis?.totalRevenue?.growthPercentage}%` : 'Current period'}"\n`;
      csv += `Total Bookings,${kpis?.totalBookings?.value || 0},"${kpis?.totalBookings?.hasComparison ? `${kpis?.totalBookings?.isPositive ? '+' : '-'}${kpis?.totalBookings?.growthPercentage}%` : 'Current period'}"\n`;
      csv += `Active Venues,${kpis?.activeVenues?.value || 0},"${kpis?.activeVenues?.percentage}% of total listings"\n`;
      csv += `Registered Customers,${kpis?.registeredUsers?.value || 0},"${kpis?.registeredUsers?.newInPeriod || 0} new in period"\n`;
      csv += `Venue Owners,${kpis?.venueOwners?.value || 0},"${kpis?.venueOwners?.newInPeriod || 0} new in period"\n`;
      csv += `Average Booking Value,"${formatCurrency(kpis?.averageBookingValue?.value || 0)}","${kpis?.averageBookingValue?.hasComparison ? `${kpis?.averageBookingValue?.isPositive ? '+' : '-'}${kpis?.averageBookingValue?.growthPercentage}%` : 'Current period'}"\n\n`;

      // 2. Revenue Timeline
      csv += `DAILY REVENUE & RESERVATION TIMELINE\n`;
      csv += `Date,Revenue (INR),Bookings Count\n`;
      (revenueTimeline || []).forEach((row) => {
        csv += `${row.date},${row.revenue},${row.bookingsCount}\n`;
      });
      csv += `\n`;

      // 3. Top Performing Venues
      csv += `TOP PERFORMING VENUES\n`;
      csv += `Rank,Venue Name,Category,City,Owner,Total Bookings,Completed Bookings,Gross Revenue (INR),Average Rating\n`;
      (topVenues || []).forEach((v) => {
        csv += `${v.rank},"${v.name}","${v.category}","${v.city}","${v.ownerName}",${v.totalBookings},${v.completedBookings},${v.totalRevenue},${v.averageRating || 0}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `eventflow_analytics_${range}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Analytics CSV report exported successfully!');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to generate export file.');
    }
  };

  const kpis = analytics?.kpis || {};
  const revenueTimeline = analytics?.revenueTimeline || [];
  const bookingActivity = analytics?.bookingActivityTimeline || [];
  const bookingStatus = analytics?.bookingStatusDistribution || [];
  const venueStatus = analytics?.venueStatusDistribution || [];
  const topVenues = analytics?.topVenues || [];
  const categoryBreakdown = analytics?.categoryBreakdown || [];
  const cityBreakdown = analytics?.cityBreakdown || [];
  const growthTimeline = analytics?.growthTimeline || [];
  const recentActivity = analytics?.recentActivity || [];
  const insights = analytics?.insights || {};

  // Calculations for SVGs
  const maxRevenue = useMemo(() => {
    return Math.max(...revenueTimeline.map((d) => d.revenue || 0), 1000);
  }, [revenueTimeline]);

  const maxActivityBookings = useMemo(() => {
    return Math.max(...bookingActivity.map((d) => d.total || 0), 5);
  }, [bookingActivity]);

  const maxGrowth = useMemo(() => {
    return Math.max(
      ...growthTimeline.map((d) => Math.max(d.newCustomers || 0, d.newOwners || 0, d.newVenues || 0)),
      4
    );
  }, [growthTimeline]);

  const maxVenueRevenue = useMemo(() => {
    return Math.max(...topVenues.map((v) => v.totalRevenue || 0), 1000);
  }, [topVenues]);

  const totalStatusBookings = useMemo(() => {
    return bookingStatus.reduce((acc, cur) => acc + cur.count, 0);
  }, [bookingStatus]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 60, maxWidth: 1400, margin: '0 auto' }}>
      {/* ─── Page Header ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#6344f5', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
            EXECUTIVE INTELLIGENCE
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-display)', margin: 0 }}>
            Analytics
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0 0' }}>
            Understand how EventFlow is performing across venues, bookings and users.
          </p>
        </div>

        {/* Action Controls & Date Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Date Range Selector */}
          <div
            style={{
              display: 'flex',
              background: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 14,
              padding: 4,
              gap: 4,
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            }}
          >
            {DATE_RANGES.map((r) => {
              const isActive = range === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    if (r.id === 'custom') {
                      setIsCustomOpen(!isCustomOpen);
                    } else {
                      setRange(r.id);
                      setIsCustomOpen(false);
                    }
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: isActive ? '#6344f5' : 'transparent',
                    color: isActive ? '#ffffff' : '#64748b',
                    boxShadow: isActive ? '0 2px 8px rgba(99, 68, 245, 0.3)' : 'none',
                  }}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* Export Report Button */}
          <button
            onClick={handleExportCSV}
            disabled={loading || !analytics}
            className="btn btn-secondary"
            style={{ borderRadius: 12, padding: '8px 14px', fontSize: 13, gap: 6, fontWeight: 700 }}
            title="Download CSV report of active analytics"
          >
            <Download size={15} />
            Export Report
          </button>

          {/* Refresh Button */}
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="btn btn-secondary"
            style={{ borderRadius: 12, padding: '8px 12px', fontSize: 13 }}
            title="Refresh analytics data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Custom Date Range Popover */}
      {isCustomOpen && (
        <div
          className="card"
          style={{
            padding: '16px 20px',
            borderRadius: 16,
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
            marginTop: -12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
            <Calendar size={16} style={{ color: '#6344f5' }} /> Select Custom Range:
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-subtle)',
                fontSize: 12,
                outline: 'none',
              }}
            />
            <span style={{ fontSize: 12, color: '#94a3b8' }}>to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-subtle)',
                fontSize: 12,
                outline: 'none',
              }}
            />
          </div>
          <button
            onClick={() => {
              if (!customStart || !customEnd) {
                toast.error('Please select both start and end dates');
                return;
              }
              setRange('custom');
              fetchAnalytics();
            }}
            className="btn btn-primary btn-sm"
            style={{ borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700 }}
          >
            Apply Range
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && !loading && (
        <div
          className="card"
          style={{
            padding: '18px 24px',
            borderRadius: 16,
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#b91c1c',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertCircle size={20} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Unable to load analytics.</div>
              <div style={{ fontSize: 12, marginTop: 2 }}>{error}</div>
            </div>
          </div>
          <button
            onClick={fetchAnalytics}
            className="btn btn-secondary btn-sm"
            style={{ background: '#fff', borderColor: '#fca5a5', color: '#b91c1c', fontWeight: 700 }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ─── Top KPI Section (6 Cards) ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          {
            title: 'TOTAL REVENUE',
            val: formatCurrency(kpis.totalRevenue?.value || 0),
            kpiData: kpis.totalRevenue,
            icon: DollarSign,
            iconColor: '#6344f5',
            iconBg: '#f0ebff',
          },
          {
            title: 'TOTAL BOOKINGS',
            val: (kpis.totalBookings?.value || 0).toLocaleString('en-IN'),
            kpiData: kpis.totalBookings,
            icon: CalendarCheck,
            iconColor: '#3b82f6',
            iconBg: '#eff6ff',
          },
          {
            title: 'ACTIVE VENUES',
            val: `${(kpis.activeVenues?.value || 0).toLocaleString('en-IN')}`,
            subText: `${kpis.activeVenues?.percentage || 100}% of ${kpis.activeVenues?.total || 0} listings`,
            icon: Building2,
            iconColor: '#10b981',
            iconBg: '#ecfdf5',
          },
          {
            title: 'REGISTERED USERS',
            val: (kpis.registeredUsers?.value || 0).toLocaleString('en-IN'),
            kpiData: kpis.registeredUsers,
            icon: Users,
            iconColor: '#8b5cf6',
            iconBg: '#f5f3ff',
          },
          {
            title: 'VENUE OWNERS',
            val: (kpis.venueOwners?.value || 0).toLocaleString('en-IN'),
            kpiData: kpis.venueOwners,
            icon: UserCheck,
            iconColor: '#f59e0b',
            iconBg: '#fffbeb',
          },
          {
            title: 'AVG BOOKING VALUE',
            val: formatCurrency(kpis.averageBookingValue?.value || 0),
            kpiData: kpis.averageBookingValue,
            icon: BarChart3,
            iconColor: '#0ea5e9',
            iconBg: '#f0f9ff',
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          const kpi = card.kpiData;

          return (
            <div
              key={idx}
              className="card"
              style={{
                padding: '20px',
                borderRadius: 18,
                background: 'var(--surface-1)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 12,
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {card.title}
                </span>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: card.iconBg,
                    color: card.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={18} />
                </div>
              </div>

              <div>
                {loading ? (
                  <div style={{ height: 28, width: '60%', background: 'var(--bg-subtle)', borderRadius: 6 }} className="animate-pulse" />
                ) : (
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                    {card.val}
                  </div>
                )}
              </div>

              <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {card.subText ? (
                  <span style={{ color: '#64748b', fontWeight: 600 }}>{card.subText}</span>
                ) : kpi?.hasComparison ? (
                  <>
                    <span
                      style={{
                        color: kpi.isPositive ? '#10b981' : '#ef4444',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      {kpi.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {kpi.growthPercentage}%
                    </span>
                    <span style={{ color: '#94a3b8' }}>vs previous period</span>
                  </>
                ) : (
                  <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Current period</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── CHART 1 — REVENUE OVERVIEW ─────────────────────────────── */}
      <div
        className="card"
        style={{
          padding: '24px 28px',
          borderRadius: 20,
          background: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-display)', margin: 0 }}>
              Revenue Overview
            </h2>
            <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0 0' }}>
              Real-time gross transaction value generated from confirmed and completed reservations.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#6344f5' }}>
              <span style={{ width: 12, height: 4, borderRadius: 2, background: '#6344f5' }} />
              Selected Period
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#6344f5', fontFamily: 'var(--font-display)' }}>
              {formatCurrency(kpis.totalRevenue?.value || 0)}
            </div>
          </div>
        </div>

        {/* SVG Line / Area Chart */}
        {loading ? (
          <div style={{ height: 260, background: 'var(--bg-subtle)', borderRadius: 14 }} className="animate-pulse" />
        ) : revenueTimeline.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <DollarSign size={40} style={{ margin: '0 auto 8px auto', color: '#94a3b8' }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>No revenue recorded in this period</div>
            <div style={{ fontSize: 12, marginTop: 2 }}>Confirmed reservations will display revenue data here.</div>
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%', height: 260 }}>
            {/* Chart SVG */}
            <svg
              viewBox="0 0 1000 260"
              preserveAspectRatio="none"
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="revenueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6344f5" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#6344f5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((ratio, i) => (
                <g key={i}>
                  <line
                    x1="0"
                    y1={240 - ratio * 200}
                    x2="1000"
                    y2={240 - ratio * 200}
                    stroke="var(--border-subtle)"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x="10"
                    y={235 - ratio * 200}
                    fill="#94a3b8"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {formatCompactNumber(maxRevenue * ratio)}
                  </text>
                </g>
              ))}

              {/* Area Path */}
              {(() => {
                const step = 1000 / Math.max(revenueTimeline.length - 1, 1);
                const points = revenueTimeline.map((pt, i) => {
                  const x = i * step;
                  const y = 240 - (pt.revenue / maxRevenue) * 200;
                  return `${x},${y}`;
                });
                const d = `M 0,240 L ${points.join(' L ')} L 1000,240 Z`;
                return <path d={d} fill="url(#revenueAreaGrad)" />;
              })()}

              {/* Line Path */}
              {(() => {
                const step = 1000 / Math.max(revenueTimeline.length - 1, 1);
                const points = revenueTimeline.map((pt, i) => {
                  const x = i * step;
                  const y = 240 - (pt.revenue / maxRevenue) * 200;
                  return `${x},${y}`;
                });
                return (
                  <path
                    d={`M ${points.join(' L ')}`}
                    fill="none"
                    stroke="#6344f5"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })()}

              {/* Data Points */}
              {revenueTimeline.map((pt, i) => {
                const step = 1000 / Math.max(revenueTimeline.length - 1, 1);
                const x = i * step;
                const y = 240 - (pt.revenue / maxRevenue) * 200;
                const isHovered = activeRevenueHover?.index === i;

                return (
                  <g key={i} onMouseEnter={() => setActiveRevenueHover({ ...pt, x, y, index: i })}>
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 6 : pt.revenue > 0 ? 4 : 2}
                      fill={isHovered ? '#fff' : '#6344f5'}
                      stroke="#6344f5"
                      strokeWidth={isHovered ? 3 : 2}
                      style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Interactive Floating Tooltip */}
            {activeRevenueHover && (
              <div
                style={{
                  position: 'absolute',
                  left: `${(activeRevenueHover.x / 1000) * 100}%`,
                  top: Math.max(10, activeRevenueHover.y - 80),
                  transform: 'translateX(-50%)',
                  background: '#0f172a',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: 10,
                  fontSize: 12,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  pointerEvents: 'none',
                  zIndex: 20,
                  whiteSpace: 'nowrap',
                }}
              >
                <div style={{ fontWeight: 800, color: '#a78bfa' }}>{activeRevenueHover.label}</div>
                <div style={{ marginTop: 2, fontWeight: 700 }}>
                  Revenue: <span style={{ color: '#10b981' }}>{formatCurrency(activeRevenueHover.revenue)}</span>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  {activeRevenueHover.bookingsCount} reservation{activeRevenueHover.bookingsCount === 1 ? '' : 's'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── CHART 2 — BOOKING ACTIVITY ─────────────────────────────── */}
      <div
        className="card"
        style={{
          padding: '24px 28px',
          borderRadius: 20,
          background: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-display)', margin: 0 }}>
              Booking Activity
            </h2>
            <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0 0' }}>
              Reservation volume progression categorized by status across the selected timeframe.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#6344f5' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#6344f5' }} /> Confirmed
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#10b981' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} /> Completed
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} /> Pending
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#ef4444' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} /> Cancelled
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ height: 220, background: 'var(--bg-subtle)', borderRadius: 14 }} className="animate-pulse" />
        ) : bookingActivity.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <CalendarCheck size={36} style={{ margin: '0 auto 8px auto', color: '#94a3b8' }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>No booking activity recorded for this period</div>
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%', height: 220 }}>
            {/* SVG Stacked Bar Chart */}
            <svg
              viewBox="0 0 1000 220"
              preserveAspectRatio="none"
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
              {/* Baseline */}
              <line x1="0" y1="200" x2="1000" y2="200" stroke="var(--border-subtle)" strokeWidth="1" />

              {bookingActivity.map((pt, i) => {
                const totalBars = bookingActivity.length;
                const colWidth = 1000 / totalBars;
                const barWidth = Math.max(4, Math.min(24, colWidth * 0.6));
                const x = i * colWidth + (colWidth - barWidth) / 2;

                const confirmedH = (pt.confirmed / maxActivityBookings) * 180;
                const completedH = (pt.completed / maxActivityBookings) * 180;
                const pendingH = (pt.pending / maxActivityBookings) * 180;
                const cancelledH = (pt.cancelled / maxActivityBookings) * 180;

                let currentY = 200;

                return (
                  <g
                    key={i}
                    onMouseEnter={() => setActiveActivityHover({ ...pt, x: x + barWidth / 2, y: 100 })}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Confirmed segment */}
                    {confirmedH > 0 && (
                      <rect
                        x={x}
                        y={(currentY -= confirmedH)}
                        width={barWidth}
                        height={confirmedH}
                        fill="#6344f5"
                        rx="2"
                      />
                    )}
                    {/* Completed segment */}
                    {completedH > 0 && (
                      <rect
                        x={x}
                        y={(currentY -= completedH)}
                        width={barWidth}
                        height={completedH}
                        fill="#10b981"
                        rx="2"
                      />
                    )}
                    {/* Pending segment */}
                    {pendingH > 0 && (
                      <rect
                        x={x}
                        y={(currentY -= pendingH)}
                        width={barWidth}
                        height={pendingH}
                        fill="#f59e0b"
                        rx="2"
                      />
                    )}
                    {/* Cancelled segment */}
                    {cancelledH > 0 && (
                      <rect
                        x={x}
                        y={(currentY -= cancelledH)}
                        width={barWidth}
                        height={cancelledH}
                        fill="#ef4444"
                        rx="2"
                      />
                    )}

                    {/* Zero activity placeholder tick */}
                    {pt.total === 0 && (
                      <rect x={x} y="196" width={barWidth} height="4" fill="var(--border-subtle)" rx="1" />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip */}
            {activeActivityHover && (
              <div
                style={{
                  position: 'absolute',
                  left: `${(activeActivityHover.x / 1000) * 100}%`,
                  top: 20,
                  transform: 'translateX(-50%)',
                  background: '#0f172a',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: 10,
                  fontSize: 12,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  pointerEvents: 'none',
                  zIndex: 20,
                  whiteSpace: 'nowrap',
                }}
              >
                <div style={{ fontWeight: 800, color: '#a78bfa' }}>{activeActivityHover.label}</div>
                <div style={{ marginTop: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div>Confirmed: <span style={{ color: '#a78bfa', fontWeight: 700 }}>{activeActivityHover.confirmed}</span></div>
                  <div>Completed: <span style={{ color: '#10b981', fontWeight: 700 }}>{activeActivityHover.completed}</span></div>
                  <div>Pending: <span style={{ color: '#f59e0b', fontWeight: 700 }}>{activeActivityHover.pending}</span></div>
                  <div>Cancelled: <span style={{ color: '#ef4444', fontWeight: 700 }}>{activeActivityHover.cancelled}</span></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── TWO COLUMN: BOOKING STATUS DONUT & VENUE STATUS DONUT ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* CHART 3 — BOOKING STATUS DONUT */}
        <div
          className="card"
          style={{
            padding: '24px 28px',
            borderRadius: 20,
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)', margin: 0 }}>
              Booking Status Breakdown
            </h2>
            <p style={{ color: '#64748b', fontSize: 12, margin: '2px 0 0 0' }}>
              Proportion of reservations by resolution state.
            </p>
          </div>

          {loading ? (
            <div style={{ height: 180, background: 'var(--bg-subtle)', borderRadius: 14 }} className="animate-pulse" />
          ) : bookingStatus.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
              <PieChart size={36} style={{ margin: '0 auto 8px auto', color: '#94a3b8' }} />
              <div style={{ fontSize: 13, fontWeight: 700 }}>No booking status data available</div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
              {/* Donut graphic */}
              <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0, margin: '0 auto' }}>
                <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                  {(() => {
                    let cumulativePercent = 0;
                    return bookingStatus.map((seg, idx) => {
                      const strokeDasharray = `${seg.percentage} ${100 - seg.percentage}`;
                      const strokeDashoffset = -cumulativePercent;
                      cumulativePercent += seg.percentage;

                      return (
                        <circle
                          key={idx}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke={seg.color}
                          strokeWidth="16"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          pathLength="100"
                          style={{ transition: 'all 0.3s ease' }}
                        />
                      );
                    });
                  })()}
                </svg>
                {/* Center text hole */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                    {totalStatusBookings}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginTop: 2 }}>
                    Bookings
                  </div>
                </div>
              </div>

              {/* Status List Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: '1 1 160px' }}>
                {bookingStatus.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 12,
                      padding: '4px 8px',
                      borderRadius: 8,
                      background: 'var(--bg-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>{item.count}</span>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CHART 7 — VENUE STATUS BREAKDOWN */}
        <div
          className="card"
          style={{
            padding: '24px 28px',
            borderRadius: 20,
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)', margin: 0 }}>
              Venue Listing Status
            </h2>
            <p style={{ color: '#64748b', fontSize: 12, margin: '2px 0 0 0' }}>
              Moderation status across all {kpis.activeVenues?.total || 0} registered properties in MongoDB.
            </p>
          </div>

          {loading ? (
            <div style={{ height: 180, background: 'var(--bg-subtle)', borderRadius: 14 }} className="animate-pulse" />
          ) : venueStatus.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
              <Building2 size={36} style={{ margin: '0 auto 8px auto', color: '#94a3b8' }} />
              <div style={{ fontSize: 13, fontWeight: 700 }}>No venue status recorded</div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
              {/* Donut graphic */}
              <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0, margin: '0 auto' }}>
                <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                  {(() => {
                    let cumulativePercent = 0;
                    return venueStatus.map((seg, idx) => {
                      const strokeDasharray = `${seg.percentage} ${100 - seg.percentage}`;
                      const strokeDashoffset = -cumulativePercent;
                      cumulativePercent += seg.percentage;

                      return (
                        <circle
                          key={idx}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke={seg.color}
                          strokeWidth="16"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          pathLength="100"
                          style={{ transition: 'all 0.3s ease' }}
                        />
                      );
                    });
                  })()}
                </svg>
                {/* Center text hole */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                    {kpis.activeVenues?.total || 0}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginTop: 2 }}>
                    Venues
                  </div>
                </div>
              </div>

              {/* Status List Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: '1 1 160px' }}>
                {venueStatus.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 12,
                      padding: '4px 8px',
                      borderRadius: 8,
                      background: 'var(--bg-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>{item.count}</span>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── CHART 4 — TOP PERFORMING VENUES (HORIZONTAL BAR CHART) ── */}
      <div
        className="card"
        style={{
          padding: '24px 28px',
          borderRadius: 20,
          background: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-display)', margin: 0 }}>
              Top Performing Venues by Revenue
            </h2>
            <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0 0' }}>
              Highest grossing banquet halls, lawns, and convention centers on EventFlow.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ height: 200, background: 'var(--bg-subtle)', borderRadius: 14 }} className="animate-pulse" />
        ) : topVenues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
            <Building2 size={36} style={{ margin: '0 auto 8px auto', color: '#94a3b8' }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>No revenue data available yet.</div>
            <div style={{ fontSize: 12, marginTop: 2 }}>Top performing venues will rank here as bookings are placed.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {topVenues.slice(0, 5).map((venue, idx) => {
              const percentage = maxVenueRevenue > 0 ? (venue.totalRevenue / maxVenueRevenue) * 100 : 0;

              return (
                <div
                  key={venue._id}
                  onClick={() => navigate(`/admin/venues/${venue._id}`)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRadius: 12,
                    transition: 'background 0.15s ease',
                  }}
                  className="table-row-hover"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 800, color: '#6344f5', width: 20 }}>#{idx + 1}</span>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>{venue.name}</span>
                      <span style={{ fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>
                        ({venue.city || 'India'})
                      </span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>• {venue.totalBookings} bookings</span>
                    </div>
                    <div style={{ fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
                      {formatCurrency(venue.totalRevenue)}
                    </div>
                  </div>

                  {/* Bar */}
                  <div style={{ width: '100%', height: 8, background: 'var(--bg-subtle)', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.max(percentage, 3)}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #6344f5 0%, #8b5cf6 100%)',
                        borderRadius: 4,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── TOP VENUES DETAILED TABLE ──────────────────────────────── */}
      <div
        className="card"
        style={{
          borderRadius: 20,
          background: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-display)', margin: 0 }}>
            Top Performing Venues Ledger
          </h2>
          <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0 0' }}>
            Comprehensive performance breakdown of the top 10 property listings in MongoDB.
          </p>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading top venues...</div>
        ) : topVenues.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No venues found for this period.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>Rank</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>Venue</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>Owner</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>Bookings</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>Gross Revenue</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>Rating</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 18px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {topVenues.map((venue) => (
                  <tr
                    key={venue._id}
                    onClick={() => navigate(`/admin/venues/${venue._id}`)}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#6344f5' }}>
                      #{venue.rank}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={venue.coverImage || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=100'}
                          alt={venue.name}
                          style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                        />
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{venue.name}</div>
                          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>
                            {String(venue.category || '').replace('-', ' ')} • {venue.city || 'India'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{venue.ownerName}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{venue.ownerEmail}</div>
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>
                      {venue.totalBookings}
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: 900, color: '#10b981' }}>
                      {formatCurrency(venue.totalRevenue)}
                    </td>

                    <td style={{ padding: '14px 16px', color: '#f59e0b', fontWeight: 700 }}>
                      ★ {venue.averageRating || 0}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${venue.status === 'active' ? 'badge-success' : 'badge-error'}`} style={{ fontSize: 11 }}>
                        {venue.status === 'active' ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/venues/${venue._id}`);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ borderRadius: 8, padding: '5px 10px', fontSize: 12, gap: 4 }}
                      >
                        <Eye size={13} /> View Venue
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── TWO COLUMN: PLATFORM GROWTH & VENUE PERFORMANCE SUMMARY ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {/* CHART 6 — PLATFORM GROWTH */}
        <div
          className="card"
          style={{
            padding: '24px 28px',
            borderRadius: 20,
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)', margin: 0 }}>
              Platform Growth
            </h2>
            <p style={{ color: '#64748b', fontSize: 12, margin: '2px 0 0 0' }}>
              New customer accounts, venue owners, and venue listings joined in this period.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, fontSize: 11, fontWeight: 700 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6344f5' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6344f5' }} /> Customers
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#3b82f6' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} /> Hosts
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} /> Venues
            </span>
          </div>

          {loading ? (
            <div style={{ height: 180, background: 'var(--bg-subtle)', borderRadius: 14 }} className="animate-pulse" />
          ) : growthTimeline.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
              <Users size={36} style={{ margin: '0 auto 8px auto', color: '#94a3b8' }} />
              <div style={{ fontSize: 13, fontWeight: 700 }}>No growth data recorded for this period</div>
            </div>
          ) : (
            <div style={{ position: 'relative', width: '100%', height: 180 }}>
              <svg viewBox="0 0 1000 180" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <line x1="0" y1="160" x2="1000" y2="160" stroke="var(--border-subtle)" strokeWidth="1" />

                {/* Customer line */}
                {(() => {
                  const step = 1000 / Math.max(growthTimeline.length - 1, 1);
                  const points = growthTimeline.map((pt, i) => `${i * step},${160 - (pt.newCustomers / maxGrowth) * 140}`);
                  return <path d={`M ${points.join(' L ')}`} fill="none" stroke="#6344f5" strokeWidth="2.5" strokeLinecap="round" />;
                })()}

                {/* Owner line */}
                {(() => {
                  const step = 1000 / Math.max(growthTimeline.length - 1, 1);
                  const points = growthTimeline.map((pt, i) => `${i * step},${160 - (pt.newOwners / maxGrowth) * 140}`);
                  return <path d={`M ${points.join(' L ')}`} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3" />;
                })()}

                {/* Venue line */}
                {(() => {
                  const step = 1000 / Math.max(growthTimeline.length - 1, 1);
                  const points = growthTimeline.map((pt, i) => `${i * step},${160 - (pt.newVenues / maxGrowth) * 140}`);
                  return <path d={`M ${points.join(' L ')}`} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />;
                })()}
              </svg>
            </div>
          )}
        </div>

        {/* CHART 5 — VENUE PERFORMANCE (CATEGORY & CITY SUMMARY) */}
        <div
          className="card"
          style={{
            padding: '24px 28px',
            borderRadius: 20,
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)', margin: 0 }}>
              Venue Performance Summary
            </h2>
            <p style={{ color: '#64748b', fontSize: 12, margin: '2px 0 0 0' }}>
              Revenue distribution across property categories and primary urban markets.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {categoryBreakdown.slice(0, 4).map((cat, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'var(--bg-subtle)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', textTransform: 'capitalize' }}>
                    {cat.category?.replace('-', ' ')}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{cat.bookings} reservations</div>
                </div>
                <div style={{ fontWeight: 900, color: '#6344f5', fontSize: 13 }}>
                  {formatCurrency(cat.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── TWO COLUMN: RECENT ACTIVITY & REVENUE INSIGHTS ─────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {/* RECENT PLATFORM ACTIVITY TIMELINE */}
        <div
          className="card"
          style={{
            padding: '24px 28px',
            borderRadius: 20,
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)', margin: 0 }}>
              Recent Platform Activity
            </h2>
            <p style={{ color: '#64748b', fontSize: 12, margin: '2px 0 0 0' }}>
              Live audit stream of bookings, property registrations, and account events.
            </p>
          </div>

          {loading ? (
            <div style={{ height: 200, background: 'var(--bg-subtle)', borderRadius: 14 }} className="animate-pulse" />
          ) : recentActivity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
              <Clock size={36} style={{ margin: '0 auto 8px auto', color: '#94a3b8' }} />
              <div style={{ fontSize: 13, fontWeight: 700 }}>No recent activity available.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 380, overflowY: 'auto' }}>
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  onClick={() => item.link && navigate(item.link)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: 'var(--bg-subtle)',
                    cursor: item.link ? 'pointer' : 'default',
                  }}
                  className="table-row-hover"
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: item.type === 'booking' ? '#eff6ff' : item.type === 'venue' ? '#ecfdf5' : '#f5f3ff',
                      color: item.type === 'booking' ? '#3b82f6' : item.type === 'venue' ? '#10b981' : '#8b5cf6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {item.type === 'booking' ? <CalendarCheck size={16} /> : item.type === 'venue' ? <Building2 size={16} /> : <Users size={16} />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: 12, color: '#0f172a' }}>{item.title}</div>
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>
                        {item.timestamp ? new Date(item.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* REVENUE INSIGHTS SECTION */}
        <div
          className="card"
          style={{
            padding: '24px 28px',
            borderRadius: 20,
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} style={{ color: '#6344f5' }} /> Revenue Insights & Intelligence
            </h2>
            <p style={{ color: '#64748b', fontSize: 12, margin: '2px 0 0 0' }}>
              Dynamically derived intelligence calculated from active platform transactions.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
            {/* Highest Revenue Venue */}
            <div style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Highest Revenue Property</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                {insights.highestRevenueVenue?.name || 'No bookings placed'}
              </div>
              {insights.highestRevenueVenue && (
                <div style={{ fontSize: 12, color: '#10b981', fontWeight: 700, marginTop: 1 }}>
                  {formatCurrency(insights.highestRevenueVenue.revenue)} generated ({insights.highestRevenueVenue.city || 'India'})
                </div>
              )}
            </div>

            {/* Most Booked Venue */}
            <div style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Most Booked Venue</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                {insights.mostBookedVenue?.name || 'No reservations yet'}
              </div>
              {insights.mostBookedVenue && (
                <div style={{ fontSize: 12, color: '#6344f5', fontWeight: 700, marginTop: 1 }}>
                  {insights.mostBookedVenue.bookings} bookings placed
                </div>
              )}
            </div>

            {/* Avg Revenue Per Active Venue */}
            <div style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Avg Revenue Per Active Property</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                {formatCurrency(insights.averageRevenuePerActiveVenue || 0)}
              </div>
            </div>

            {/* Platform Conversion Rate */}
            <div style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Top Generating Category</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                {insights.topCategory?.category || 'Banquet Hall'}
              </div>
              {insights.topCategory && (
                <div style={{ fontSize: 12, color: '#6344f5', fontWeight: 700, marginTop: 1 }}>
                  {formatCurrency(insights.topCategory.revenue)} total revenue
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
