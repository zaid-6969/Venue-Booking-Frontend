/**
 * Venues Thunks
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import venuesService from '../services/venuesService';

export const fetchVenues = createAsyncThunk(
  'venues/fetchVenues',
  async (params, { rejectWithValue }) => {
    try { return await venuesService.getAll(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchVenueById = createAsyncThunk(
  'venues/fetchVenueById',
  async (id, { rejectWithValue }) => {
    try { return await venuesService.getById(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchVenueBySlug = createAsyncThunk(
  'venues/fetchVenueBySlug',
  async (slug, { rejectWithValue }) => {
    try { return await venuesService.getBySlug(slug); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchFeaturedVenues = createAsyncThunk(
  'venues/fetchFeaturedVenues',
  async (_, { rejectWithValue }) => {
    try { return await venuesService.getFeatured(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchMyVenues = createAsyncThunk(
  'venues/fetchMyVenues',
  async (_, { rejectWithValue }) => {
    try { return await venuesService.getByOwner(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createVenue = createAsyncThunk(
  'venues/createVenue',
  async (data, { rejectWithValue }) => {
    try { return await venuesService.create(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateVenue = createAsyncThunk(
  'venues/updateVenue',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await venuesService.update(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const deleteVenue = createAsyncThunk(
  'venues/deleteVenue',
  async (id, { rejectWithValue }) => {
    try {
      await venuesService.delete(id);
      return id;
    }
    catch (err) { return rejectWithValue(err); }
  }
);

export const searchVenues = createAsyncThunk(
  'venues/searchVenues',
  async (params, { rejectWithValue }) => {
    try { return await venuesService.search(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchVenueAvailability = createAsyncThunk(
  'venues/fetchAvailability',
  async ({ id, params }, { rejectWithValue }) => {
    try { return await venuesService.getAvailability(id, params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateVenueStatus = createAsyncThunk(
  'venues/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try { return await venuesService.updateStatus(id, status); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const duplicateVenue = createAsyncThunk(
  'venues/duplicate',
  async (id, { rejectWithValue }) => {
    try { return await venuesService.duplicate(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateVenueAvailability = createAsyncThunk(
  'venues/updateAvailability',
  async ({ id, availability }, { rejectWithValue }) => {
    try { return await venuesService.updateAvailability(id, availability); }
    catch (err) { return rejectWithValue(err); }
  }
);
