import { createSlice } from '@reduxjs/toolkit';

const initialState = { stats: null, isLoading: false, error: null };
const dashboardSlice = createSlice({ name: 'dashboard', initialState, reducers: {} });
export default dashboardSlice.reducer;
