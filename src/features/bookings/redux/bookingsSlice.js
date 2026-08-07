/**
 * Bookings Service, Thunks & Slice (combined for brevity in Phase 1)
 * Split into separate files in Phase 2 when booking components are built
 */
import apiClient from '@lib/apiClient';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// ─── Service ────────────────────────────────────────────────────────────────
const BASE = '/bookings';

export const bookingsService = {
  create:       (data)   => apiClient.post(BASE, data),
  getAll:       (params) => apiClient.get(BASE, { params }),
  getById:      (id)     => apiClient.get(`${BASE}/${id}`),
  getMyBookings:(params) => apiClient.get(`${BASE}/my-bookings`, { params }),
  getOwnerBookings: (params) => apiClient.get(`${BASE}/owner-bookings`, { params }),
  cancel:       (id, reason) => apiClient.post(`${BASE}/${id}/cancel`, { reason }),
  confirm:      (id)     => apiClient.post(`${BASE}/${id}/confirm`),
  reject:       (id, reason) => apiClient.post(`${BASE}/${id}/reject`, { reason }),
  getInvoice:   (id)     => apiClient.get(`${BASE}/${id}/invoice`),
};

// ─── Thunks ─────────────────────────────────────────────────────────────────
export const createBooking = createAsyncThunk(
  'bookings/create',
  async (data, { rejectWithValue }) => {
    try { return await bookingsService.create(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchMyBookings = createAsyncThunk(
  'bookings/fetchMy',
  async (params, { rejectWithValue }) => {
    try { return await bookingsService.getMyBookings(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchOwnerBookings = createAsyncThunk(
  'bookings/fetchOwner',
  async (params, { rejectWithValue }) => {
    try { return await bookingsService.getOwnerBookings(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchBookingById = createAsyncThunk(
  'bookings/fetchById',
  async (id, { rejectWithValue }) => {
    try { return await bookingsService.getById(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async ({ id, reason }, { rejectWithValue }) => {
    try { return await bookingsService.cancel(id, reason); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const confirmBooking = createAsyncThunk(
  'bookings/confirm',
  async (id, { rejectWithValue }) => {
    try { return await bookingsService.confirm(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const rejectBooking = createAsyncThunk(
  'bookings/reject',
  async ({ id, reason }, { rejectWithValue }) => {
    try { return await bookingsService.reject(id, reason); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchBookingInvoice = createAsyncThunk(
  'bookings/fetchInvoice',
  async (id, { rejectWithValue }) => {
    try { return await bookingsService.getInvoice(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const deleteBooking = createAsyncThunk(
  'bookings/delete',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`${BASE}/${id}`);
      return id;
    } catch (err) { return rejectWithValue(err); }
  }
);

// ─── Slice ──────────────────────────────────────────────────────────────────
const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    myBookings:      [],
    ownerBookings:   [],
    allBookings:     [],
    selectedBooking: null,
    invoice:         null,
    status:          'idle',
    detailStatus:    'idle',
    createStatus:    'idle',
    error:           null,
    createError:     null,
    // Booking flow state
    bookingDraft: {
      venueId:       null,
      eventDate:     null,
      guestCount:    null,
      packageId:     null,
      extraServices: [],
      specialReq:    '',
    },
  },
  reducers: {
    setBookingDraft:   (state, action) => { state.bookingDraft = { ...state.bookingDraft, ...action.payload }; },
    clearBookingDraft: (state)         => { state.bookingDraft = bookingsSlice.getInitialState().bookingDraft; },
    clearCreateState:  (state)         => { state.createStatus = 'idle'; state.createError = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending,   (s) => { s.createStatus = 'loading'; s.createError = null; })
      .addCase(createBooking.fulfilled, (s, { payload }) => {
        s.createStatus = 'succeeded';
        s.selectedBooking = payload.booking;
        s.myBookings.unshift(payload.booking);
      })
      .addCase(createBooking.rejected,  (s, { payload }) => { s.createStatus = 'failed'; s.createError = payload; });

    builder
      .addCase(fetchMyBookings.pending,   (s) => { s.status = 'loading'; })
      .addCase(fetchMyBookings.fulfilled, (s, { payload }) => {
        const data = payload?.data || payload || {};
        s.status = 'succeeded';
        s.myBookings = Array.isArray(data) ? data : Array.isArray(data.bookings) ? data.bookings : [];
      })
      .addCase(fetchMyBookings.rejected,  (s, { payload }) => { s.status = 'failed'; s.error = payload; });

    builder
      .addCase(fetchOwnerBookings.pending,   (s) => { s.status = 'loading'; })
      .addCase(fetchOwnerBookings.fulfilled, (s, { payload }) => {
        const data = payload?.data || payload || {};
        s.status = 'succeeded';
        s.ownerBookings = Array.isArray(data) ? data : Array.isArray(data.bookings) ? data.bookings : [];
      })
      .addCase(fetchOwnerBookings.rejected,  (s, { payload }) => { s.status = 'failed'; s.error = payload; });

    builder
      .addCase(fetchBookingById.pending,   (s) => { s.detailStatus = 'loading'; })
      .addCase(fetchBookingById.fulfilled, (s, { payload }) => { s.detailStatus = 'succeeded'; s.selectedBooking = payload.booking; })
      .addCase(fetchBookingById.rejected,  (s, { payload }) => { s.detailStatus = 'failed'; s.error = payload; });

    builder.addCase(cancelBooking.fulfilled, (s, { payload }) => {
      const booking = payload.booking || payload;
      const updateIn = (arr) => { const i = arr.findIndex(b => b._id === booking._id); if (i !== -1) arr[i] = booking; };
      updateIn(s.myBookings);
      updateIn(s.ownerBookings);
      if (s.selectedBooking?._id === booking._id) s.selectedBooking = booking;
    });

    builder.addCase(confirmBooking.fulfilled, (s, { payload }) => {
      const booking = payload.booking || payload?.data?.booking || payload;
      const i = s.ownerBookings.findIndex(b => b._id === booking._id);
      if (i !== -1) s.ownerBookings[i] = booking;
      if (s.selectedBooking?._id === booking._id) s.selectedBooking = booking;
    });

    builder.addCase(rejectBooking.fulfilled, (s, { payload }) => {
      const booking = payload.booking || payload?.data?.booking || payload;
      const i = s.ownerBookings.findIndex(b => b._id === booking._id);
      if (i !== -1) s.ownerBookings[i] = booking;
      if (s.selectedBooking?._id === booking._id) s.selectedBooking = booking;
    });

    builder.addCase(deleteBooking.fulfilled, (s, { payload: id }) => {
      s.myBookings = s.myBookings.filter(b => b._id !== id);
      s.ownerBookings = s.ownerBookings.filter(b => b._id !== id);
      if (s.selectedBooking?._id === id) s.selectedBooking = null;
    });

    builder
      .addCase(fetchBookingInvoice.fulfilled, (s, { payload }) => { s.invoice = payload.invoice; });
  },
});

export const { setBookingDraft, clearBookingDraft, clearCreateState } = bookingsSlice.actions;

export const selectMyBookings      = (s) => Array.isArray(s.bookings?.myBookings) ? s.bookings.myBookings : [];
export const selectOwnerBookings   = (s) => Array.isArray(s.bookings?.ownerBookings) ? s.bookings.ownerBookings : [];
export const selectSelectedBooking = (s) => s.bookings.selectedBooking;
export const selectBookingStatus   = (s) => s.bookings.status;
export const selectCreateStatus    = (s) => s.bookings.createStatus;
export const selectCreateError     = (s) => s.bookings.createError;
export const selectBookingDraft    = (s) => s.bookings.bookingDraft;
export const selectInvoice         = (s) => s.bookings.invoice;

export default bookingsSlice.reducer;
