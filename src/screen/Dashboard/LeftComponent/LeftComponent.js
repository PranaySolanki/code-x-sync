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
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);

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
    color: #e2e8f0;
    margin-bottom: 0.75rem;

    span{
        font-weight: 700;
        background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
`;

const SubHeading = styled.div`
    font-size: 1.5rem;
    color: #cbd5e1;
    opacity: 0.9;
    margin-bottom: 1.5rem;
`;

const AddNewButton = styled.button`
    padding: 0.5rem 1.25rem;
    font-size: 1rem;
    border: 1px solid rgba(71, 85, 105, 0.4);
    border-radius: 12px;
    background: rgba(30, 41, 59, 0.6);
    color: #e2e8f0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    span{
        font-size: 1.25rem;
        font-weight: 700;
    }

    &:hover{
        cursor: pointer;
        transform: translateY(-2px);
        background: rgba(30, 41, 59, 0.8);
        border-color: rgba(100, 116, 139, 1);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
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
