import React, { useContext } from 'react';
import styled from 'styled-components';
import LeftComponent from '@/screen/Dashboard/LeftComponent/LeftComponent';
import RightComponent from '@/screen/Dashboard/Rightcomponent/RightComponent';
import Modal from '@/screen/Dashboard/components/Create_file_dialog';
import { ModalContext } from '@/screen/Dashboard/components/Dialog_box_state';

const StyledHome = styled.div`
  width: 100%;
  min-height: 100vh;
`;

const Home = () => {
  const { isOpenModal } = useContext(ModalContext);

  return (
    <StyledHome>
      <LeftComponent />
      <RightComponent />
      {isOpenModal.show && <Modal />}
    </StyledHome>
  );
};

export default Home;
