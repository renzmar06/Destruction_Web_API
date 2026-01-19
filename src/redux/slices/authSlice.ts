import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  resetMessage: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  resetMessage: null,
};;

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: { firstName: string; lastName: string; phone: string; address: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        return rejectWithValue(data.message || 'Registration failed');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue('Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        return rejectWithValue(data.message || 'Login failed');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue('Login failed');
    }
  }
);

export const validateResetToken = createAsyncThunk(
  'auth/validateResetToken',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/validate-reset-token?token=${token}`);
      
      if (!response.ok) {
        const data = await response.json();
        return rejectWithValue(data.message || 'Token validation failed');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue('Token validation failed');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (resetData: { token: string; password: string; confirmPassword: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        return rejectWithValue(data.message || 'Password reset failed');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue('Password reset failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        return rejectWithValue(data.message || 'Failed to send reset link');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue('Failed to send reset link');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearResetMessage: (state) => {
      state.resetMessage = null;
    },
    logout: (state) => {
      state.user = null;
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        // Clear cookies
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    },
    loadUserFromStorage: (state) => {
      if (typeof window !== 'undefined') {
        const user = localStorage.getItem('user');
        if (user && user !== 'undefined' && user !== 'null') {
          try {
            state.user = JSON.parse(user);
          } catch {
            localStorage.removeItem('user');
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        // Store in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(action.payload.user));
          localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Registration failed';
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        // Store in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(action.payload.user));
          localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Login failed';
      })
      .addCase(validateResetToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateResetToken.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(validateResetToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Token validation failed';
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.resetMessage = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.resetMessage = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Password reset failed';
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.resetMessage = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.resetMessage = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to send reset link';
      });
  },
});

export const { clearError, clearResetMessage, logout, loadUserFromStorage } = authSlice.actions;
export default authSlice.reducer;