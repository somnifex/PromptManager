import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }) => {
    const response = await axios.post(`${API_BASE_URL}/users/login/`, {
      username,
      password,
    });
    return response.data;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ username, email, password, role }) => {
    const response = await axios.post(`${API_BASE_URL}/users/register/`, {
      username,
      email,
      password,
      password_confirm: password,
      role,
    });
    return response.data;
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/profile/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch user');
    }
  }
);

export const refreshUserData = createAsyncThunk(
  'auth/refreshUserData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        throw new Error('No token available');
      }
      const response = await axios.get(`${API_BASE_URL}/users/profile/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to refresh user data');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token'),
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
    },
    // 添加一个action来恢复认证状态
    restoreAuth: (state) => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (token) {
        state.token = token;
        state.user = user;
        axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.error = null;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        axios.defaults.headers.common['Authorization'] = `Token ${action.payload.token}`;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        axios.defaults.headers.common['Authorization'] = `Token ${action.payload.token}`;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // 如果获取用户信息失败，可能是token无效，清除认证状态
        if (action.payload?.status === 401) {
          state.user = null;
          state.token = null;
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
        }
      })
      .addCase(refreshUserData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshUserData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(refreshUserData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, restoreAuth, clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;