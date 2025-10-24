import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { IoTrashOutline } from 'react-icons/io5';
import { BiEditAlt } from 'react-icons/bi';
import { FcOpenedFolder } from 'react-icons/fc';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import Image from 'next/image';
import logo from '../assets/logo.png';
import { ModalContext } from '../context/ModalContext';
import { PlaygroundContext } from '../context/PlaygroundContext';
import { useRouter } from 'next/navigation';

const StyledRightComponent = styled.div`
    position: fixed;
    top: 0;
    left: 40%;
    width: 57.5%;
    height: 100vh;
    padding: 2rem;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
    overflow-y: auto;
    overflow-x: hidden;

    /* Custom scrollbar styling */
    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(15, 23, 42, 0.3);
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(71, 85, 105, 0.6);
        border-radius: 4px;
        transition: background 0.3s ease;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: rgba(100, 116, 139, 0.8);
    }

    @media (max-width: 768px){
        position: relative;
        width: 100%;
        height: auto;
        min-height: 100vh;
        padding: 1rem 0.5rem;
    }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(71, 85, 105, 0.4);
  margin-bottom: 1rem;
`;

const Heading = styled.h3`
  font-size: ${props => props.size === 'small' ? "1.25rem" : "1.75rem"};
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e2e8f0;
  span{
    font-weight: 700;
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const AddButton = styled.div`
    font-size: 1rem;
    border-radius: 30px;
    color: #e2e8f0;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 1rem;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.4);
    transition: all 0.3s ease;
    span{
        font-size: 1.5rem;
        font-weight: 700;
    }

    &:hover{
        cursor: pointer;
        background: rgba(30, 41, 59, 0.8);
        border-color: rgba(100, 116, 139, 1);
        transform: translateY(-2px);
    }
`;

const FolderCard = styled.div`
    margin-bottom: 1rem;
`;

const FolderIcons = styled.div`
    display: flex;
    align-items: center;
    gap: 0.7rem;
    cursor: pointer;
    color: #e2e8f0;
    
    svg {
        color: #94a3b8;
        transition: color 0.3s ease;
        
        &:hover {
            color: #06b6d4;
        }
    }
`;

const PlayGroundCards = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    transition: all 0.3s ease;
    overflow: hidden;

    @media (max-width: 428px){
        grid-template-columns: 1fr;
    }
`;

const CollapsibleContent = styled.div`
    transition: all 0.3s ease;
    overflow: hidden;
    max-height: ${props => props.$isOpen ? '1000px' : '0'};
    opacity: ${props => props.$isOpen ? '1' : '0'};
`;

const FolderHeader = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(71, 85, 105, 0.4);
    margin-bottom: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(30, 41, 59, 0.3);
        border-radius: 8px;
        padding: 0.75rem;
    }
`;

const ChevronIcon = styled.div`
    color: #94a3b8;
    transition: all 0.3s ease;
    transform: ${props => props.$isOpen ? 'rotate(0deg)' : 'rotate(-90deg)'};
    
    &:hover {
        color: #06b6d4;
    }
`;

const Card = styled.div`
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 12px;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.4);
    backdrop-filter: blur(20px);
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);

    &:hover{
      transform: translateY(-2px);
      background: rgba(30, 41, 59, 0.8);
      border-color: rgba(100, 116, 139, 1);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }
`;

const CardContainer = styled.div`
  display: flex;
  align-items: center;
`;

const CardContent = styled.div`
  p {
    margin: 0;
    color: #cbd5e1;
  }
`;

const Logo = styled(Image)`
    width: 70px;
    margin-right: 1rem;

    @media (max-width: 425px){
        width: 50px;
        margin-right: 0.5rem;
    }
`;

const RightComponent = () => {
  const router = useRouter();
  const [collapsedFolders, setCollapsedFolders] = useState({});

  const { openModal } = useContext(ModalContext);
  const { folders, deleteFolder, deleteCard } = useContext(PlaygroundContext);

  const toggleFolder = (folderId) => {
    setCollapsedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  return (
    <StyledRightComponent>
      <Header>
        <Heading size="large">
          My <span>Projects</span>
        </Heading>
        <AddButton onClick={() => openModal({
          show: true,
          modalType: 1,
          identifiers: {
            folderId: "",
            cardId: "",
          }
        })}> <span>+</span> New Project</AddButton>
      </Header>

      {
        Object.entries(folders).map(([folderId, folder]) => (
          <FolderCard key={folderId}>
            <FolderHeader onClick={() => toggleFolder(folderId)}>
              <Heading size="small">
                <FcOpenedFolder /> {folder.title}
                <ChevronIcon $isOpen={!collapsedFolders[folderId]}>
                  <IoChevronDown />
                </ChevronIcon>
              </Heading>
              <FolderIcons onClick={(e) => e.stopPropagation()}>
                <IoTrashOutline onClick={() => deleteFolder(folderId)} />
                <BiEditAlt onClick={() => openModal({
                  show: true,
                  modalType: 4,
                  identifiers: {
                    folderId: folderId,
                    cardId: "",
                  }
                })} />
                <AddButton onClick={() => openModal({
                  show: true,
                  modalType: 2,
                  identifiers: {
                    folderId: folderId,
                    cardId: "",
                  }
                })}><span>+</span> New File</AddButton>
              </FolderIcons>
            </FolderHeader>

            <CollapsibleContent $isOpen={!collapsedFolders[folderId]}>
              <PlayGroundCards>
                {
                  Object.entries(folder.playgrounds).map(([playgroundId, playground]) => (
                    <Card key={playgroundId} onClick={() => {
                      router.push(`/playground?fileId=${playgroundId}&fileName=${playground.title}&language=${playground.language}`);
                    }}>
                      <CardContainer>
                        <Logo src={logo} alt="logo" width={70} height={70} />
                        <CardContent>
                          <p>{playground.title}</p>
                          <p>Language: {playground.language}</p>
                        </CardContent>
                      </CardContainer>
                      <FolderIcons onClick={(e) => {
                        e.stopPropagation();
                      }}>
                        <IoTrashOutline onClick={() => deleteCard(folderId, playgroundId)} />
                        <BiEditAlt onClick={() => openModal({
                          show: true,
                          modalType: 5,
                          identifiers: {
                            folderId: folderId,
                            cardId: playgroundId,
                          }
                        })} />
                      </FolderIcons>
                    </Card>
                  ))
                }
              </PlayGroundCards>
            </CollapsibleContent>
          </FolderCard>
        ))
      }
    </StyledRightComponent>
  );
};

export default RightComponent;
