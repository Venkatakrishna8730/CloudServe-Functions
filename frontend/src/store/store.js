import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import functionsReducer from "./slices/functionsSlice";
import usageReducer from "./slices/usageSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    functions: functionsReducer,
    usage: usageReducer,
  },
});

export default store;
