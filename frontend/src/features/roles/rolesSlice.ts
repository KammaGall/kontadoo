import { createSlice } from '@reduxjs/toolkit';
const initialState = { roles: [], isLoading: false, error: null };
const rolesSlice = createSlice({ name: 'roles', initialState, reducers: {} });
export default rolesSlice.reducer;
