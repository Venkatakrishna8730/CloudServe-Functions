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

export const redeployFunction = createAsyncThunk(
  "functions/redeployFunction",
  async (functionId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(ROUTES.FUNCTIONS.REDEPLOY(functionId));
      return { id: functionId, status: data.status };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to redeploy function"
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
      
      .addCase(createFunction.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      
      .addCase(deleteFunction.fulfilled, (state, action) => {
        state.list = state.list.filter((f) => f._id !== action.payload);
      })
      
      .addCase(updateFunction.fulfilled, (state, action) => {
        const index = state.list.findIndex((f) => f._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      
      .addCase(redeployFunction.fulfilled, (state, action) => {
        const index = state.list.findIndex((f) => f._id === action.payload.id);
        if (index !== -1) {
          state.list[index].status = action.payload.status;
        }
      });
  },
});

export const { clearFunctionsError } = functionsSlice.actions;
export default functionsSlice.reducer;
