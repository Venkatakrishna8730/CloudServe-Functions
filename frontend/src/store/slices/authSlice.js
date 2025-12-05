import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { ROUTES } from "../../utils/api";

// Async Thunks
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(ROUTES.AUTH.ME);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Auth check failed");
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.post(ROUTES.AUTH.LOGIN, { email, password });
      // After successful login, fetch user details
      dispatch(checkAuth());
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Login failed");
    }
  }
);

export const signup = createAsyncThunk(
  "auth/signup",
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.post(ROUTES.AUTH.SIGNUP, userData);
      // Do not checkAuth here, wait for verification
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Signup failed");
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async ({ email, code }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.post(ROUTES.AUTH.VERIFY, { email, code });
      dispatch(checkAuth());
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Verification failed");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post(ROUTES.AUTH.LOGOUT);
    } catch (error) {
      return rejectWithValue(error.response?.data || "Logout failed");
    }
  }
);

export const regenerateApiKey = createAsyncThunk(
  "auth/regenerateApiKey",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post(ROUTES.AUTH.REGENERATE_API_KEY);
      return data.apiKey;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to regenerate API key"
      );
    }
  }
);

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (credential, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.post(ROUTES.AUTH.GOOGLE_LOGIN, { credential });
      dispatch(checkAuth());
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Google login failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: true,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.error = null;
      })
      .addCase(login.fulfilled, () => {
        // User is set by checkAuth
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload?.message || "Login failed";
      })
      // Signup
      .addCase(signup.pending, (state) => {
        state.error = null;
      })
      .addCase(signup.fulfilled, () => {
        // User is set by checkAuth
      })
      .addCase(signup.rejected, (state, action) => {
        state.error = action.payload?.message || "Signup failed";
      })
      // Verify Email
      .addCase(verifyEmail.pending, (state) => {
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, () => {
        // User is set by checkAuth
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.error = action.payload?.message || "Verification failed";
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.error = null;
      })
      // Regenerate API Key
      .addCase(regenerateApiKey.fulfilled, (state, action) => {
        if (state.user) {
          state.user.apiKey = action.payload;
        }
      })
      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, () => {
        // User is set by checkAuth
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.error = action.payload?.message || "Google login failed";
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
