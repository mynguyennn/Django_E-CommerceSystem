// productContext.js
import { createContext, useReducer, useContext } from "react";
import productReducer, { initialState } from "../reducer/CompareProductReducer";

const ProductContext = createContext({});

const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, initialState);

  return (
    <ProductContext.Provider value={{ state, dispatch }}>
      {children}
    </ProductContext.Provider>
  );
};

const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProductContext phải sử dụng trong ProductProvider");
  }
  return context;
};

export { ProductProvider, useProductContext };
