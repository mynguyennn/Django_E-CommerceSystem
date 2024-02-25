import React, { createContext, useContext, useReducer } from "react";
import StoreReducer from "../reducer/StoreReducer";

export const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(StoreReducer, {
    storeData: null,
  });

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("Lỗi!");
  }
  return context;
};
