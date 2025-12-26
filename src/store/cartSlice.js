import { createSlice } from '@reduxjs/toolkit';

const initialState = [];  

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      if(!state.find(job => job.id === action.payload.id)) {
        state.push(action.payload);
      }
    },
    deleteFromCart: (state, action) => {
      return state.filter(job => job.id !== action.payload.id);
    }
  },
});

export const { addToCart, deleteFromCart } = cartSlice.actions;
export default cartSlice.reducer;