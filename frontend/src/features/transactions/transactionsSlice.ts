import { createSlice } from '@reduxjs/toolkit';
const initialState = { transactions: [], isLoading: false, error: null };
const transactionsSlice = createSlice({ name: 'transactions', initialState, reducers: {} });
export default transactionsSlice.reducer;
