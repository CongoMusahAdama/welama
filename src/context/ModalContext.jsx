import React, { createContext, useContext, useState } from "react";
import ProductDetailModal from "../components/modals/ProductDetailModal";

const ModalContext = createContext(null);

export const ModalProvider = ({ children, products = [] }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const openProduct = (product) => setSelectedProduct(product);
  const closeProduct = () => setSelectedProduct(null);

  return (
    <ModalContext.Provider
      value={{ selectedProduct, openProduct, closeProduct, products }}
    >
      {children}
      <ProductDetailModal />
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
