import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';
import { showToast } from './notificationSlice';

// ---------------------
// ASYNC THUNKS (Actions)
// ---------------------

// 1. Register User
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      localStorage.setItem('token', response.data.data.token);
      dispatch(showToast({ message: 'Registration Successful', type: 'success' }));
      return response.data.data;
    } catch (error) {
      let msg = error.response?.data?.message || 'Registration failed';
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const details = error.response.data.errors.map(e => e.message).join(', ');
        msg = `${msg}: ${details}`;
      }
      return rejectWithValue(msg);
    }
  }
);

// 2. Login User
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      localStorage.setItem('token', response.data.data.token);
      return response.data.data;
    } catch (error) {
      let msg = error.response?.data?.message || 'Invalid email or password';
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const details = error.response.data.errors.map(e => e.message).join(', ');
        msg = `${msg}: ${details}`;
      }
      return rejectWithValue(msg);
    }
  }
);

// 3. Load Current User Profile (called on app reload if token exists)
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data.data; // Returns { user }
    } catch (error) {
      localStorage.removeItem('token');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to authenticate token'
      );
    }
  }
);

// Initial State
const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,
  isLoading: !!localStorage.getItem('token'),
  error: null,
};

// ---------------------
// AUTH SLICE
// ---------------------
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })

      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })

      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { logout, clearErrors } = authSlice.actions;
export default authSlice.reducer;
