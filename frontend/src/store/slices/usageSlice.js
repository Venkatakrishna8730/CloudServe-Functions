import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { ROUTES } from "../../utils/api";

export const fetchUsages = createAsyncThunk(
  "usage/fetchUsages",
  async (functionId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(ROUTES.USAGE.GET(functionId));
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch usage data"
      );
    }
  }
);

export const fetchAllUsages = createAsyncThunk(
  "usage/fetchAllUsages",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(ROUTES.USAGE.ALL);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch recent activity"
      );
    }
  }
);

const usageSlice = createSlice({
  name: "usage",
  initialState: {
    list: [],
    recentActivity: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearUsageError: (state) => {
      state.error = null;
    },
    clearUsageList: (state) => {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsages.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch usage data";
      })
      .addCase(fetchAllUsages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsages.fulfilled, (state, action) => {
        state.loading = false;
        state.recentActivity = action.payload;
      })
      .addCase(fetchAllUsages.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch recent activity";
      });
  },
});

export const { clearUsageError, clearUsageList } = usageSlice.actions;
export default usageSlice.reducer;
