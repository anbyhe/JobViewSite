import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import jobReducer from "./jobSlice";

const store = configureStore({
  reducer: {
    cart: cartReducer,
    job: jobReducer,
  },
});

export default store;