import React, { createContext, useState } from 'react';

export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [isOpenModal, setIsOpenModal] = useState({
    show: false,
    modalType: null,
    identifiers: {
      folderId: "",
      cardId: "",
    }
  });

  const openModal = (payload) => {
    setIsOpenModal(payload);
  };

  const closeModal = () => {
    setIsOpenModal({
      show: false,
      modalType: null,
      identifiers: {
        folderId: "",
        cardId: "",
      }
    });
  };

  return (
    <ModalContext.Provider value={{ isOpenModal, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};
