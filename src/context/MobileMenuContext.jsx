import React, { createContext, useContext, useState } from "react";

const MobileMenuContext = createContext({
  isOpen: false,
  open: () => {},
  close: () => {},
  setOpen: () => {},
});

export const MobileMenuProvider = ({ children }) => {
  const [isOpen, setOpen] = useState(false);
  return (
    <MobileMenuContext.Provider
      value={{
        isOpen,
        open: () => setOpen(true),
        close: () => setOpen(false),
        setOpen,
      }}
    >
      {children}
    </MobileMenuContext.Provider>
  );
};

export const useMobileMenu = () => useContext(MobileMenuContext);
