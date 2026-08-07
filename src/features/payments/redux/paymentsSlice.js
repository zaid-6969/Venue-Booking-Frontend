/**
 * Payments Slice + Thunks + Service
 *
 * Mock Payment Architecture:
 * - Simulates real payment gateway flow
 * - processPayment → mock success/fail → webhook-like response
 * - Same interface as real Razorpay/Stripe would use
 * - Real gateway integration = swap processPayment() only
 */
import apiClient from '@lib/apiClient';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const BASE = '/payments';

export const paymentsService = {
  initiate:       (data) => apiClient.post(`${BASE}/initiate`, data),
  process:        (data) => apiClient.post(`${BASE}/process`, data),
  verify:         (data) => apiClient.post(`${BASE}/verify`, data),
  getById:        (id)   => apiClient.get(`${BASE}/${id}`),
  getMyPayments:  ()     => apiClient.get(`${BASE}/my-payments`),
  requestRefund:  (id, reason) => apiClient.post(`${BASE}/${id}/refund`, { reason }),
  getInvoice:     (id)   => apiClient.get(`${BASE}/${id}/invoice`),
};

export const initiatePayment = createAsyncThunk('payments/initiate',
  async (data, { rejectWithValue }) => {
    try { return await paymentsService.initiate(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const processPayment = createAsyncThunk('payments/process',
  async (data, { rejectWithValue }) => {
    try { return await paymentsService.process(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const verifyPayment = createAsyncThunk('payments/verify',
  async (data, { rejectWithValue }) => {
    try { return await paymentsService.verify(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchPaymentById = createAsyncThunk('payments/fetchById',
  async (id, { rejectWithValue }) => {
    try { return await paymentsService.getById(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchMyPayments = createAsyncThunk('payments/fetchMy',
  async (_, { rejectWithValue }) => {
    try { return await paymentsService.getMyPayments(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const requestRefund = createAsyncThunk('payments/refund',
  async ({ id, reason }, { rejectWithValue }) => {
    try { return await paymentsService.requestRefund(id, reason); }
    catch (err) { return rejectWithValue(err); }
  }
);

const paymentsSlice = createSlice({
  name: 'payments',
  initialState: {
    myPayments:      [],
    selectedPayment: null,
    // Payment flow
    paymentOrder:    null, // from initiate — contains orderId, amount, etc.
    paymentResult:   null, // from process — success/failure + transactionId
    invoice:         null,
    // Status
    initiateStatus:  'idle',
    processStatus:   'idle',
    verifyStatus:    'idle',
    fetchStatus:     'idle',
    error:           null,
  },
  reducers: {
    resetPaymentFlow: (s) => {
      s.paymentOrder  = null;
      s.paymentResult = null;
      s.initiateStatus = 'idle';
      s.processStatus  = 'idle';
      s.verifyStatus   = 'idle';
      s.error          = null;
    },
    setPaymentResult: (s, { payload }) => {
      s.paymentResult = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initiatePayment.pending,   (s) => { s.initiateStatus = 'loading'; s.error = null; })
      .addCase(initiatePayment.fulfilled, (s, { payload }) => {
        s.initiateStatus = 'succeeded';
        s.paymentOrder   = payload.order;
      })
      .addCase(initiatePayment.rejected,  (s, { payload }) => {
        s.initiateStatus = 'failed';
        s.error = payload;
      });

    builder
      .addCase(processPayment.pending,   (s) => { s.processStatus = 'loading'; })
      .addCase(processPayment.fulfilled, (s, { payload }) => {
        s.processStatus = 'succeeded';
        s.paymentResult = payload;
      })
      .addCase(processPayment.rejected,  (s, { payload }) => {
        s.processStatus = 'failed';
        s.error = payload;
        s.paymentResult = { success: false, error: payload };
      });

    builder
      .addCase(fetchMyPayments.fulfilled, (s, { payload }) => {
        s.fetchStatus  = 'succeeded';
        s.myPayments   = payload.payments;
      });

    builder
      .addCase(fetchPaymentById.fulfilled, (s, { payload }) => {
        s.selectedPayment = payload.payment;
        s.invoice         = payload.invoice;
      });
  },
});

export const { resetPaymentFlow, setPaymentResult } = paymentsSlice.actions;

export const selectPaymentOrder   = (s) => s.payments.paymentOrder;
export const selectPaymentResult  = (s) => s.payments.paymentResult;
export const selectMyPayments     = (s) => s.payments.myPayments;
export const selectSelectedPayment = (s) => s.payments.selectedPayment;
export const selectInitiateStatus = (s) => s.payments.initiateStatus;
export const selectProcessStatus  = (s) => s.payments.processStatus;
export const selectPaymentInvoice = (s) => s.payments.invoice;

export default paymentsSlice.reducer;
