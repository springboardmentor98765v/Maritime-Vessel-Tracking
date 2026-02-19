import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import vesselService from "../../services/vesselService";

// Async thunk to fetch all vessels from backend
export const fetchVessels = createAsyncThunk(
  "vessels/fetchVessels",
  async (_, thunkAPI) => {
    try {
      const response = await vesselService.getAllVessels();
      return response.data; // Expecting array of vessels
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  vessels: [],      // List of vessels
  loading: false,   // Loading state
  error: null,      // Error message
  filters: {        // Filter state
    name: "",
    type: "",
    flag: "",
  },
};

const vesselSlice = createSlice({
  name: "vessels",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVessels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVessels.fulfilled, (state, action) => {
        state.loading = false;
        state.vessels = action.payload;
      })
      .addCase(fetchVessels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch vessels";
      });
  },
});

export const { setFilters } = vesselSlice.actions;
export default vesselSlice.reducer;
