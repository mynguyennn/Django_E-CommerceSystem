import React, { createContext, useReducer, useContext } from "react";
import { refreshDataReducer } from "../reducer/RefreshDataReducer";

const RefreshDataContext = createContext();

export const RefreshDataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(refreshDataReducer, false);

  return (
    <RefreshDataContext.Provider value={{ state, dispatch }}>
      {children}
    </RefreshDataContext.Provider>
  );
};

export const useRefreshData = () => {
  return useContext(RefreshDataContext);
};
