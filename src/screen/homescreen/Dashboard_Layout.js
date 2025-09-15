import React, { useContext } from 'react';
import styled from 'styled-components';
import LeftComponent from '@/screen/homescreen/LeftComponent/LeftComponent';
import RightComponent from '@/screen/homescreen/Rightcomponent/RightComponent';
import Modal from '@/screen/homescreen/components/Create_file_dialog';
import { ModalContext } from '@/screen/homescreen/components/Dialog_box_state';

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
