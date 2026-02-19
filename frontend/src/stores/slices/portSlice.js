import { createSlice } from "@reduxjs/toolkit";

const portSlice = createSlice({
  name: "port",
  initialState: {
    ports: [],
  },
  reducers: {
    addPort: (state, action) => {
      state.ports.push(action.payload);
    },
  },
});

export const { addPort } = portSlice.actions;
export default portSlice.reducer;
