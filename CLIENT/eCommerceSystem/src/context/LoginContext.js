import React, { createContext, useReducer, useContext } from "react";
import LoginReducer from "../reducer/LoginReducer";

export const LoginContext = createContext();

const initialUser = null;

export const LoginProvider = ({ children }) => {
  const [user, dispatch] = useReducer(LoginReducer, initialUser);

  return (
    <LoginContext.Provider value={[user, dispatch]}>
      {children}
    </LoginContext.Provider>
  );
};

export const useLogin = () => {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error("useLogin không nằm trong LoginProvider");
  }
  return context;
};
