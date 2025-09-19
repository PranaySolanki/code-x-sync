import React, { useContext } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import logo from '@/assets/logo.png';
import { ModalContext } from '@/screen/Dashboard/components/Dialog_box_state';

const StyledLeftComponent = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 40%;
    height: 100vh;
    background-color: #1e1e1e;

    display: flex;
    justify-content: center;
    align-items: center;

    @media (max-width: 768px){
        position: relative;
        width: 100%;
    }
`;

const ContentContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    height: 100%;
`;

const Logo = styled(Image)`
    width: 165px;
    margin-bottom: 1rem;
`;

const MainHeading = styled.h1`
    font-size: 2.5rem;
    font-weight: 400;
    color: #fff;
    margin-bottom: 0.75rem;

    span{
        font-weight: 700;
    }
`;

const SubHeading = styled.div`
    font-size: 1.5rem;
    color: #fff;
    opacity: 0.7;
    margin-bottom: 1.5rem;
`;

const AddNewButton = styled.button`
    padding: 0.25rem 1.5rem;
    font-size: 1rem;
    border: none;
    border-radius: 30px;
    box-shadow: 0px 0px 4px 2px #8b8b8b;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    transition: all 0.2s ease-in-out;
    span{
        font-size: 2rem;
        font-weight: 700;
    }

    &:hover{
        cursor: pointer;
        scale: 1.05;
        box-shadow: 0px 0px 6px 2px #8b8b8b;
    }
`;

const LeftComponent = () => {
    const { openModal } = useContext(ModalContext);

    return (
        <StyledLeftComponent>
            <ContentContainer>
                <Logo src={logo} alt="logo" width={165} height={165} />
                <MainHeading> <span>Code</span> Dashboard</MainHeading>
                <SubHeading>Code. Compile. Debug.</SubHeading>
                <AddNewButton onClick={() => openModal({
                    show: true,
                    modalType: 1,
                    identifiers: {
                        folderId: "",
                        cardId: "",
                    }
                })} > 
                 <span>+</span> Create New Project</AddNewButton>
            </ContentContainer>
        </StyledLeftComponent>
    );
};

export default LeftComponent;
