import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { ROUTES } from "../../utils/api";

export const fetchFunctions = createAsyncThunk(
  "functions/fetchFunctions",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(ROUTES.FUNCTIONS.LIST);
      return data.functions;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch functions"
      );
    }
  }
);

export const createFunction = createAsyncThunk(
  "functions/createFunction",
  async (functionData, { rejectWithValue }) => {
    try {
      const { data } = await api.post(ROUTES.FUNCTIONS.DEPLOY, functionData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to create function"
      );
    }
  }
);

export const deleteFunction = createAsyncThunk(
  "functions/deleteFunction",
  async (functionId, { rejectWithValue }) => {
    try {
      await api.delete(ROUTES.FUNCTIONS.DELETE(functionId));
      return functionId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete function"
      );
    }
  }
);

export const updateFunction = createAsyncThunk(
  "functions/updateFunction",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(ROUTES.FUNCTIONS.UPDATE(id), data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update function"
      );
    }
  }
);

const functionsSlice = createSlice({
  name: "functions",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearFunctionsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Functions
      .addCase(fetchFunctions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFunctions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchFunctions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch functions";
      })
      // Create Function
      .addCase(createFunction.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      // Delete Function
      .addCase(deleteFunction.fulfilled, (state, action) => {
        state.list = state.list.filter((f) => f._id !== action.payload);
      })
      // Update Function
      .addCase(updateFunction.fulfilled, (state, action) => {
        const index = state.list.findIndex((f) => f._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      });
  },
});

export const { clearFunctionsError } = functionsSlice.actions;
export default functionsSlice.reducer;
