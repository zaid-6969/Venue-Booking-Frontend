import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import {
  Building2,
  CalendarCheck,
  DollarSign,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Eye,
  Heart,
  Package,
  Image as ImageIcon,
  FileText,
  Tag,
  BarChart3,
  PlusCircle,
  PieChart,
  Briefcase,
  Calendar,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'

import { fetchMyVenues } from '@features/venues/redux/venuesThunks'

import { selectMyVenues } from '@features/venues/redux/venuesSlice'

import {
  fetchOwnerBookings,
  confirmBooking,
  rejectBooking,
  selectOwnerBookings,
} from '@features/bookings/redux/bookingsSlice'

import { selectCurrentUser } from '@features/auth/redux/authSlice'

import toast from 'react-hot-toast'

const OwnerDashboard = () => {
  const dispatch = useDispatch()

  const user = useSelector(selectCurrentUser)

  const rawVenues = useSelector(selectMyVenues)
  const rawBookings = useSelector(selectOwnerBookings)

  const myVenues = Array.isArray(rawVenues) ? rawVenues : []

  const ownerBookings = Array.isArray(rawBookings) ? rawBookings : []

  /* ============================================================
     STATE
  ============================================================ */

  const [refreshing, setRefreshing] = useState(false)

  const [processingBookingId, setProcessingBookingId] = useState(null)

  const [calendarDate, setCalendarDate] = useState(new Date())

  /* ============================================================
     LOAD OWNER DATA
  ============================================================ */

  const loadDashboard = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true)
        }

        await Promise.all([
          dispatch(fetchMyVenues()).unwrap(),
          dispatch(fetchOwnerBookings()).unwrap(),
        ])
      } catch (error) {
        console.error('OWNER DASHBOARD LOAD ERROR:', error)

        toast.error(error?.message || 'Failed to load dashboard data')
      } finally {
        setRefreshing(false)
      }
    },
    [dispatch]
  )

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  /* ============================================================
     HELPERS
  ============================================================ */

  const getBookingStatus = (booking) => {
    return String(booking?.bookingStatus || booking?.status || '')
      .trim()
      .toLowerCase()
  }

  const getBookingAmount = (booking) => {
    const values = [
      booking?.pricing?.totalAmount,
      booking?.totalPrice,
      booking?.totalAmount,
      booking?.grandTotal,
      booking?.amount,
      booking?.finalAmount,
      booking?.bookingAmount,
    ]

    for (const value of values) {
      const number = Number(value)

      if (Number.isFinite(number) && number > 0) {
        return number
      }
    }

    return 0
  }

  const getCustomerName = (booking) => {
    return (
      booking?.customer?.name ||
      booking?.customer?.fullName ||
      booking?.user?.name ||
      booking?.user?.fullName ||
      booking?.customerName ||
      booking?.name ||
      'Customer'
    )
  }

  const getVenueName = (booking) => {
    return (
      booking?.venue?.name ||
      booking?.venueName ||
      myVenues.find(
        (venue) => String(venue?._id) === String(booking?.venueId || booking?.venue?._id)
      )?.name ||
      'Venue'
    )
  }

  const formatDate = (date) => {
    if (!date) return 'Date not specified'

    const parsed = new Date(date)

    if (Number.isNaN(parsed.getTime())) {
      return 'Date not specified'
    }

    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount) => {
    const value = Number(amount) || 0

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const isSameDay = (dateA, dateB) => {
    if (!dateA || !dateB) return false

    const a = new Date(dateA)
    const b = new Date(dateB)

    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    )
  }

  /* ============================================================
     BOOKING STATUS
  ============================================================ */

  const pendingBookings = useMemo(() => {
    return ownerBookings.filter((booking) => {
      return getBookingStatus(booking) === 'pending'
    })
  }, [ownerBookings])

  const confirmedBookings = useMemo(() => {
    return ownerBookings.filter((booking) => {
      const status = getBookingStatus(booking)

      return status === 'confirmed' || status === 'accepted' || status === 'completed'
    })
  }, [ownerBookings])

  const paidConfirmedBookings = useMemo(() => {
    return ownerBookings.filter((booking) => {
      const status = getBookingStatus(booking)

      return status === 'confirmed' || status === 'completed'
    })
  }, [ownerBookings])

  /* ============================================================
     REVENUE
  ============================================================ */

  const grossRevenue = useMemo(() => {
    return paidConfirmedBookings.reduce((total, booking) => {
      return total + getBookingAmount(booking)
    }, 0)
  }, [paidConfirmedBookings])

  /* ============================================================
     UPCOMING EVENTS
  ============================================================ */

  const upcomingEvents = useMemo(() => {
    const today = new Date()

    today.setHours(0, 0, 0, 0)

    return confirmedBookings
      .filter((booking) => {
        if (!booking?.eventDate) {
          return false
        }

        const eventDate = new Date(booking.eventDate)

        return !Number.isNaN(eventDate.getTime()) && eventDate >= today
      })
      .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
  }, [confirmedBookings])

  /* ============================================================
     TODAY'S EVENTS
  ============================================================ */

  const todaysEvents = useMemo(() => {
    const today = new Date()

    return ownerBookings
      .filter((booking) => {
        return isSameDay(booking?.eventDate, today)
      })
      .sort((a, b) => {
        const first = new Date(a.eventDate).getTime()

        const second = new Date(b.eventDate).getTime()

        return first - second
      })
  }, [ownerBookings])

  /* ============================================================
     OCCUPANCY RATE
     
     NOTE:
     This is a simple booking-based calculation because
     the existing page does not provide a dedicated
     occupancy API.
  ============================================================ */

  const occupancyRate = useMemo(() => {
    if (myVenues.length === 0 || confirmedBookings.length === 0) {
      return 0
    }

    const currentMonth = new Date().getMonth()

    const currentYear = new Date().getFullYear()

    const currentMonthBookings = confirmedBookings.filter((booking) => {
      if (!booking?.eventDate) {
        return false
      }

      const date = new Date(booking.eventDate)

      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    const availableSlots = myVenues.length * 30

    if (availableSlots === 0) {
      return 0
    }

    return Math.min(100, Math.round((currentMonthBookings.length / availableSlots) * 100))
  }, [myVenues.length, confirmedBookings])

  /* ============================================================
     RATING
  ============================================================ */

  const ratingInfo = useMemo(() => {
    let totalRating = 0
    let ratedVenueCount = 0
    let totalReviews = 0

    myVenues.forEach((venue) => {
      const rating = typeof venue?.rating === 'object' ? venue?.rating?.average : venue?.rating

      const reviewCount = Number(
        venue?.rating?.count || venue?.reviewCount || venue?.reviewsCount || 0
      )

      const parsedRating = Number(rating)

      if (Number.isFinite(parsedRating) && parsedRating > 0) {
        totalRating += parsedRating
        ratedVenueCount++
      }

      totalReviews += reviewCount
    })

    return {
      average: ratedVenueCount > 0 ? (totalRating / ratedVenueCount).toFixed(1) : '0.0',

      reviews: totalReviews,
    }
  }, [myVenues])

  /* ============================================================
     CALENDAR
  ============================================================ */

  const calendarYear = calendarDate.getFullYear()

  const calendarMonth = calendarDate.getMonth()

  const monthName = calendarDate.toLocaleString('en-US', {
    month: 'long',
  })

  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay()

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate()

  const calendarCells = []

  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day)
  }

  const getCalendarBooking = (day) => {
    if (!day) return null

    return ownerBookings.find((booking) => {
      if (!booking?.eventDate) {
        return false
      }

      const date = new Date(booking.eventDate)

      return (
        date.getFullYear() === calendarYear &&
        date.getMonth() === calendarMonth &&
        date.getDate() === day
      )
    })
  }

  const goPreviousMonth = () => {
    setCalendarDate(new Date(calendarYear, calendarMonth - 1, 1))
  }

  const goNextMonth = () => {
    setCalendarDate(new Date(calendarYear, calendarMonth + 1, 1))
  }

  /* ============================================================
     TODAY'S SCHEDULE FORMAT
  ============================================================ */

  const formatEventTime = (booking) => {
    if (!booking?.eventDate) {
      return '--'
    }

    const date = new Date(booking.eventDate)

    if (Number.isNaN(date.getTime())) {
      return '--'
    }

    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  /* ============================================================
     APPROVE BOOKING
  ============================================================ */

  const handleConfirm = async (id) => {
    if (!id) {
      toast.error('Booking ID is missing')

      return
    }

    try {
      setProcessingBookingId(id)

      await dispatch(confirmBooking(id)).unwrap()

      toast.success('Booking request accepted! Customer notified to complete payment.')

      await dispatch(fetchOwnerBookings()).unwrap()
    } catch (error) {
      console.error('CONFIRM BOOKING ERROR:', error)

      toast.error(error?.message || 'Failed to confirm booking')
    } finally {
      setProcessingBookingId(null)
    }
  }

  /* ============================================================
     REJECT BOOKING
  ============================================================ */

  const handleReject = async (id) => {
    if (!id) {
      toast.error('Booking ID is missing')

      return
    }

    const reason = window.prompt('Reason for rejecting:')

    if (!reason) {
      return
    }

    try {
      setProcessingBookingId(id)

      await dispatch(
        rejectBooking({
          id,
          reason,
        })
      ).unwrap()

      toast.success('Booking request rejected')

      await dispatch(fetchOwnerBookings()).unwrap()
    } catch (error) {
      console.error('REJECT BOOKING ERROR:', error)

      toast.error(error?.message || 'Failed to reject booking')
    } finally {
      setProcessingBookingId(null)
    }
  }

  /* ============================================================
     QUICK ACTIONS
  ============================================================ */

  const quickActions = [
    {
      label: 'Add New Venue',
      icon: PlusCircle,
      path: '/owner/venues/new',
      color: '#6344f5',
      bg: '#f0ebff',
    },
    {
      label: 'Manage Calendar',
      icon: Calendar,
      path: '/owner/calendar',
      color: '#10b981',
      bg: '#ecfdf5',
    },
    {
      label: 'Venue Packages',
      icon: Package,
      path: '/owner/venues',
      color: '#f59e0b',
      bg: '#fffbe6',
    },
    {
      label: 'Gallery Images',
      icon: ImageIcon,
      path: '/owner/venues',
      color: '#3b82f6',
      bg: '#eff6ff',
    },
    {
      label: 'Pricing & Rates',
      icon: DollarSign,
      path: '/owner/venues',
      color: '#ef4444',
      bg: '#fef2f2',
    },
    {
      label: 'Promotions',
      icon: Tag,
      path: '/owner/venues',
      color: '#8b5cf6',
      bg: '#f3e8ff',
    },
    {
      label: 'Reports',
      icon: BarChart3,
      path: '/owner/earnings',
      color: '#06b6d4',
      bg: '#cffafe',
    },
  ]

  /* ============================================================
     KPI DATA
  ============================================================ */

  const kpis = [
    {
      title: 'Total Revenue',
      value: formatCurrency(grossRevenue),
      icon: DollarSign,
      color: '#6344f5',
      background: '#6344f5',
    },
    {
      title: 'Total Bookings',
      value: ownerBookings.length,
      icon: CalendarCheck,
      color: '#22c55e',
      background: '#22c55e',
    },
    {
      title: 'Occupancy Rate',
      value: `${occupancyRate}%`,
      icon: PieChart,
      color: '#3b82f6',
      background: '#3b82f6',
    },
    {
      title: 'Pending Requests',
      value: pendingBookings.length,
      icon: Briefcase,
      color: '#f97316',
      background: '#f97316',
    },
    {
      title: 'Upcoming Events',
      value: upcomingEvents.length,
      icon: Building2,
      color: '#a855f7',
      background: '#a855f7',
    },
  ]

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        paddingBottom: 40,
      }}
    >
      {/* ========================================================
          HERO
      ======================================================== */}

      <div
        className="card"
        style={{
          position: 'relative',
          padding: '32px 40px',
          borderRadius: 24,
          background: 'linear-gradient(135deg, #f7f5ff 0%, #f0ebff 60%, #e8e2ff 100%)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          minHeight: 180,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(99, 68, 245, 0.04)',
        }}
      >
        <img
          src="/castle.png"
          alt="3D Palace"
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            height: '100%',
            width: 'auto',
            maxHeight: '100%',
            objectFit: 'contain',
            objectPosition: 'right bottom',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        <div
          style={{
            zIndex: 2,
            maxWidth: '65%',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: '#6344f5',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            WELCOME BACK 👋
          </div>

          <h1
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: '#0f172a',
              fontFamily: 'var(--font-display)',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Good morning, {user?.name?.split(' ')[0] || 'Owner'}!
          </h1>

          <p
            style={{
              color: '#64748b',
              fontSize: 14,
              margin: '0 0 24px 0',
              fontWeight: 500,
            }}
          >
            Here's what's happening with your venues today.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <Link
              to="/owner/venues/new"
              className="btn btn-primary"
              style={{
                borderRadius: 14,
                padding: '10px 22px',
                fontWeight: 700,
                fontSize: 13,
                gap: 8,
                background: '#6344f5',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 4px 14px rgba(99, 68, 245, 0.3)',
                textDecoration: 'none',
              }}
            >
              <Plus size={16} />
              Add Venue
            </Link>

            <Link
              to="/owner/calendar"
              className="btn btn-secondary"
              style={{
                borderRadius: 14,
                padding: '10px 22px',
                fontWeight: 700,
                fontSize: 13,
                gap: 8,
                background: '#ffffff',
                color: '#334155',
                border: '1px solid #e2e8f0',
                textDecoration: 'none',
              }}
            >
              <Calendar size={16} />
              Calendar
            </Link>

            <Link
              to="/owner/inquiries"
              className="btn btn-secondary"
              style={{
                borderRadius: 14,
                padding: '10px 22px',
                fontWeight: 700,
                fontSize: 13,
                gap: 8,
                background: '#ffffff',
                color: '#334155',
                border: '1px solid #e2e8f0',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <FileText size={16} />
              Inquiries
              <span
                style={{
                  background: pendingBookings.length > 0 ? '#6344f5' : '#cbd5e1',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: 22,
                  height: 22,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 800,
                  marginLeft: 4,
                }}
              >
                {pendingBookings.length}
              </span>
            </Link>

            <Link
              to="/owner/bookings"
              className="btn btn-secondary"
              style={{
                borderRadius: 14,
                padding: '10px 22px',
                fontWeight: 700,
                fontSize: 13,
                gap: 8,
                background: '#ffffff',
                color: '#334155',
                border: '1px solid #e2e8f0',
                textDecoration: 'none',
              }}
            >
              <Eye size={16} />
              View Bookings
            </Link>

            <button
              type="button"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className="btn btn-secondary"
              style={{
                borderRadius: 14,
                padding: '10px 14px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
              }}
            >
              <RefreshCw
                size={16}
                style={{
                  animation: refreshing ? 'spin 1s linear infinite' : undefined,
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          KPI CARDS
      ======================================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 16,
        }}
      >
        {kpis.map((kpi) => {
          const Icon = kpi.icon

          return (
            <div
              className="card"
              key={kpi.title}
              style={{
                padding: '20px 20px 0 20px',
                borderRadius: 20,
                background: 'var(--surface-1)',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minWidth: 0,
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: kpi.background,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 12px ${kpi.background}44`,
                    }}
                  >
                    <Icon size={22} />
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--text-tertiary)',
                      textAlign: 'right',
                    }}
                  >
                    {kpi.title}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {kpi.value}
                </div>
              </div>

              <div
                style={{
                  height: 5,
                  marginTop: 16,
                  background: `${kpi.background}18`,
                  borderRadius: '5px 5px 0 0',
                }}
              >
                <div
                  style={{
                    width: kpi.title === 'Occupancy Rate' ? `${occupancyRate}%` : '35%',
                    height: '100%',
                    background: kpi.background,
                    borderRadius: '5px 5px 0 0',
                    opacity: 0.8,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* ========================================================
          MIDDLE GRID
      ======================================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr 1fr',
          gap: 20,
        }}
      >
        {/* ======================================================
            REVENUE
        ====================================================== */}

        <div
          className="card"
          style={{
            padding: 20,
            borderRadius: 20,
            background: 'var(--surface-1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 800,
                margin: 0,
              }}
            >
              Revenue Overview
            </h3>

            <span
              style={{
                fontSize: 11,
                color: 'var(--text-tertiary)',
              }}
            >
              All time
            </span>
          </div>

          <div
            style={{
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: 'var(--text-primary)',
              }}
            >
              {formatCurrency(grossRevenue)}
            </div>

            <div
              style={{
                fontSize: 11,
                color: 'var(--text-tertiary)',
                marginTop: 3,
              }}
            >
              Based on confirmed and completed bookings
            </div>
          </div>

          <div
            style={{
              width: '100%',
              height: 160,
            }}
          >
            <svg width="100%" height="160" viewBox="0 0 400 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="ownerRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6344f5" stopOpacity="0.30" />

                  <stop offset="100%" stopColor="#6344f5" stopOpacity="0" />
                </linearGradient>
              </defs>

              <line
                x1="0"
                y1="20"
                x2="400"
                y2="20"
                stroke="var(--border-subtle)"
                strokeDasharray="3 3"
              />

              <line
                x1="0"
                y1="60"
                x2="400"
                y2="60"
                stroke="var(--border-subtle)"
                strokeDasharray="3 3"
              />

              <line
                x1="0"
                y1="100"
                x2="400"
                y2="100"
                stroke="var(--border-subtle)"
                strokeDasharray="3 3"
              />

              <line x1="0" y1="140" x2="400" y2="140" stroke="var(--border-subtle)" />

              {grossRevenue > 0 ? (
                <>
                  <path
                    d="M 0,120 C 80,90 160,110 240,50 C 300,70 350,40 400,30 L 400,140 L 0,140 Z"
                    fill="url(#ownerRevenueGradient)"
                  />

                  <path
                    d="M 0,120 C 80,90 160,110 240,50 C 300,70 350,40 400,30"
                    fill="none"
                    stroke="#6344f5"
                    strokeWidth="3.5"
                  />

                  <circle
                    cx="400"
                    cy="30"
                    r="5"
                    fill="#6344f5"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                </>
              ) : (
                <line x1="0" y1="140" x2="400" y2="140" stroke="#cbd5e1" strokeWidth="2" />
              )}
            </svg>

            <div
              style={{
                textAlign: 'center',
                fontSize: 11,
                color: 'var(--text-tertiary)',
                marginTop: 8,
              }}
            >
              Revenue chart will reflect booking history
            </div>
          </div>
        </div>

        {/* ======================================================
            CALENDAR
        ====================================================== */}

        <div
          className="card"
          style={{
            padding: 20,
            borderRadius: 20,
            background: 'var(--surface-1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 800,
                margin: 0,
              }}
            >
              Booking Calendar
            </h3>

            <Link
              to="/owner/calendar"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#6344f5',
                textDecoration: 'none',
              }}
            >
              Full Calendar →
            </Link>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <button
              type="button"
              onClick={goPreviousMonth}
              className="btn btn-secondary btn-sm"
              style={{
                padding: 5,
              }}
            >
              <ChevronLeft size={15} />
            </button>

            <strong
              style={{
                fontSize: 13,
              }}
            >
              {monthName} {calendarYear}
            </strong>

            <button
              type="button"
              onClick={goNextMonth}
              className="btn btn-secondary btn-sm"
              style={{
                padding: 5,
              }}
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 4,
              textAlign: 'center',
            }}
          >
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
              <div
                key={day}
                style={{
                  color: 'var(--text-tertiary)',
                  fontWeight: 700,
                  fontSize: 8,
                  marginBottom: 4,
                }}
              >
                {day}
              </div>
            ))}

            {calendarCells.map((day, index) => {
              const booking = getCalendarBooking(day)

              const today = new Date()

              const isToday =
                day &&
                today.getFullYear() === calendarYear &&
                today.getMonth() === calendarMonth &&
                today.getDate() === day

              const status = getBookingStatus(booking)

              const isBooked =
                booking &&
                (status === 'confirmed' || status === 'accepted' || status === 'completed')

              const isPending = booking && status === 'pending'

              return (
                <div
                  key={`${day}-${index}`}
                  title={booking ? `${getVenueName(booking)} - ${status}` : 'Available'}
                  style={{
                    height: 26,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: isToday || booking ? 800 : 500,
                    background: isToday
                      ? '#6344f5'
                      : isBooked
                        ? '#ef4444'
                        : isPending
                          ? '#f59e0b'
                          : 'transparent',
                    color: isToday || isBooked || isPending ? '#ffffff' : 'var(--text-primary)',
                  }}
                >
                  {day}
                </div>
              )
            })}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 9,
              color: 'var(--text-tertiary)',
              marginTop: 14,
              paddingTop: 10,
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <span>🟢 Available</span>

            <span>🟡 Pending</span>

            <span>🔴 Booked</span>
          </div>
        </div>

        {/* ======================================================
            TODAY'S SCHEDULE
        ====================================================== */}

        <div
          className="card"
          style={{
            padding: 20,
            borderRadius: 20,
            background: 'var(--surface-1)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 800,
                margin: 0,
              }}
            >
              Today's Schedule
            </h3>

            <Link
              to="/owner/calendar"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#6344f5',
                textDecoration: 'none',
              }}
            >
              View All →
            </Link>
          </div>

          {todaysEvents.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 30,
                textAlign: 'center',
                color: 'var(--text-tertiary)',
              }}
            >
              <Calendar
                size={34}
                style={{
                  marginBottom: 10,
                }}
              />

              <strong
                style={{
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                }}
              >
                No events today
              </strong>

              <span
                style={{
                  fontSize: 10,
                  marginTop: 4,
                }}
              >
                Your schedule is clear.
              </span>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {todaysEvents.slice(0, 5).map((booking) => {
                const status = getBookingStatus(booking)

                const confirmed =
                  status === 'confirmed' || status === 'accepted' || status === 'completed'

                return (
                  <div
                    key={booking._id}
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'center',
                      padding: 8,
                      background: 'var(--bg-subtle)',
                      borderRadius: 10,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: '#6344f5',
                        width: 60,
                        flexShrink: 0,
                      }}
                    >
                      {formatEventTime(booking)}
                    </div>

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {getVenueName(booking)}
                      </div>

                      <div
                        style={{
                          fontSize: 10,
                          color: 'var(--text-tertiary)',
                        }}
                      >
                        {getCustomerName(booking)}
                      </div>
                    </div>

                    <span
                      className={`badge ${confirmed ? 'badge-success' : 'badge-warning'}`}
                      style={{
                        fontSize: 9,
                      }}
                    >
                      {confirmed ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <Link
            to="/owner/calendar"
            className="btn btn-secondary btn-sm"
            style={{
              width: '100%',
              marginTop: 16,
              borderRadius: 10,
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              justifyContent: 'center',
              textDecoration: 'none',
            }}
          >
            <Plus size={14} />
            Add Block Time
          </Link>
        </div>
      </div>

      {/* ========================================================
          LOWER GRID
      ======================================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr 1fr',
          gap: 20,
        }}
      >
        {/* ======================================================
            RECENT BOOKING REQUESTS
        ====================================================== */}

        <div
          className="card"
          style={{
            padding: 20,
            borderRadius: 20,
            background: 'var(--surface-1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 800,
                margin: 0,
              }}
            >
              Recent Booking Requests
            </h3>

            <Link
              to="/owner/inquiries"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#6344f5',
                textDecoration: 'none',
              }}
            >
              View All →
            </Link>
          </div>

          {pendingBookings.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '30px 10px',
                color: 'var(--text-tertiary)',
              }}
            >
              <CheckCircle2
                size={34}
                style={{
                  marginBottom: 8,
                  color: '#22c55e',
                }}
              />

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                No pending requests
              </div>

              <div
                style={{
                  fontSize: 10,
                  marginTop: 4,
                }}
              >
                New booking requests will appear here.
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {pendingBookings.slice(0, 5).map((req) => {
                const processing = processingBookingId === req._id

                return (
                  <div
                    key={req._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 10,
                      background: 'var(--bg-subtle)',
                      borderRadius: 12,
                      border: '1px solid var(--border-subtle)',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: '#f0ebff',
                          color: '#6344f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {getCustomerName(req).charAt(0).toUpperCase()}
                      </div>

                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {getCustomerName(req)}
                        </div>

                        <div
                          style={{
                            fontSize: 10,
                            color: 'var(--text-tertiary)',
                            marginTop: 1,
                          }}
                        >
                          {getVenueName(req)} • {req?.guestCount || req?.guests || 0} Guests
                        </div>

                        <div
                          style={{
                            fontSize: 9,
                            color: 'var(--text-tertiary)',
                            marginTop: 2,
                          }}
                        >
                          {formatDate(req?.eventDate)}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: 6,
                        flexShrink: 0,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleConfirm(req._id)}
                        disabled={processing}
                        className="btn btn-primary btn-sm"
                        style={{
                          fontSize: 10,
                          padding: '4px 10px',
                          borderRadius: 6,
                          background: '#10b981',
                          border: 'none',
                        }}
                      >
                        <CheckCircle2 size={12} />
                        Accept
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReject(req._id)}
                        disabled={processing}
                        className="btn btn-secondary btn-sm"
                        style={{
                          fontSize: 10,
                          padding: '4px 10px',
                          borderRadius: 6,
                          color: '#ef4444',
                        }}
                      >
                        <XCircle size={12} />
                        Reject
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ======================================================
            VENUE PERFORMANCE
        ====================================================== */}

        <div
          className="card"
          style={{
            padding: 20,
            borderRadius: 20,
            background: 'var(--surface-1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 800,
                margin: 0,
              }}
            >
              Venue Performance
            </h3>

            <span
              style={{
                fontSize: 10,
                color: 'var(--text-tertiary)',
              }}
            >
              Live data
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            <div
              style={{
                padding: 12,
                background: 'var(--bg-subtle)',
                borderRadius: 14,
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--text-tertiary)',
                  fontWeight: 600,
                }}
              >
                Average Rating
              </div>

              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                  marginTop: 2,
                }}
              >
                {ratingInfo.average}
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: '#f59e0b',
                  marginTop: 2,
                }}
              >
                {ratingInfo.average !== '0.0' ? '★★★★★' : 'No ratings yet'}
              </div>
            </div>

            <div
              style={{
                padding: 12,
                background: 'var(--bg-subtle)',
                borderRadius: 14,
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--text-tertiary)',
                  fontWeight: 600,
                }}
              >
                Total Venues
              </div>

              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                  marginTop: 2,
                }}
              >
                {myVenues.length}
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: 'var(--text-tertiary)',
                  marginTop: 2,
                }}
              >
                Your listed venues
              </div>
            </div>

            <div
              style={{
                padding: 12,
                background: 'var(--bg-subtle)',
                borderRadius: 14,
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--text-tertiary)',
                  fontWeight: 600,
                }}
              >
                Confirmed Bookings
              </div>

              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                  marginTop: 2,
                }}
              >
                {confirmedBookings.length}
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: '#10b981',
                  fontWeight: 700,
                  marginTop: 2,
                }}
              >
                Current data
              </div>
            </div>

            <div
              style={{
                padding: 12,
                background: 'var(--bg-subtle)',
                borderRadius: 14,
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--text-tertiary)',
                  fontWeight: 600,
                }}
              >
                Occupancy
              </div>

              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                  marginTop: 2,
                }}
              >
                {occupancyRate}%
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: '#3b82f6',
                  fontWeight: 700,
                  marginTop: 2,
                }}
              >
                This month
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 12,
              background: 'var(--bg-subtle)',
              fontSize: 10,
              color: 'var(--text-tertiary)',
              lineHeight: 1.5,
            }}
          >
            <AlertCircle
              size={13}
              style={{
                verticalAlign: 'middle',
                marginRight: 5,
              }}
            />
            Views, wishlist and conversion metrics are displayed only when those values are provided
            by your backend.
          </div>
        </div>

        {/* ======================================================
            REVIEWS
        ====================================================== */}

        <div
          className="card"
          style={{
            padding: 20,
            borderRadius: 20,
            background: 'var(--surface-1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 800,
                margin: 0,
              }}
            >
              Recent Reviews
            </h3>

            <Link
              to="/owner/reviews"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#6344f5',
                textDecoration: 'none',
              }}
            >
              View All →
            </Link>
          </div>

          <div
            style={{
              padding: '28px 10px',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
            }}
          >
            <Star
              size={34}
              style={{
                marginBottom: 10,
                color: '#f59e0b',
              }}
            />

            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--text-secondary)',
              }}
            >
              {ratingInfo.reviews > 0
                ? `${ratingInfo.reviews} reviews available`
                : 'No reviews yet'}
            </div>

            <div
              style={{
                fontSize: 10,
                marginTop: 5,
              }}
            >
              Review details will appear here when review data is available.
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          QUICK ACTIONS
      ======================================================== */}

      <div>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: 12,
          }}
        >
          Quick Actions
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 12,
          }}
        >
          {quickActions.map((action) => {
            const Icon = action.icon

            return (
              <Link
                key={action.label}
                to={action.path}
                style={{
                  padding: '14px 10px',
                  borderRadius: 16,
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: action.bg,
                    color: action.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} />
                </div>

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    lineHeight: 1.2,
                  }}
                >
                  {action.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ========================================================
          EMPTY VENUE INFORMATION
      ======================================================== */}

      {myVenues.length === 0 && (
        <div
          className="card"
          style={{
            padding: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            border: '1px solid #e2e8f0',
          }}
        >
          <Building2 size={30} color="#6344f5" />

          <div
            style={{
              flex: 1,
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              You haven't added a venue yet
            </div>

            <div
              style={{
                fontSize: 11,
                color: 'var(--text-tertiary)',
                marginTop: 3,
              }}
            >
              Add your first venue to start receiving booking requests.
            </div>
          </div>

          <Link
            to="/owner/venues/new"
            className="btn btn-primary btn-sm"
            style={{
              gap: 5,
            }}
          >
            <Plus size={14} />
            Add Venue
          </Link>
        </div>
      )}
    </div>
  )
}

export default OwnerDashboard
