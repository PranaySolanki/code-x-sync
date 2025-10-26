'use client';
import { useEffect, useState, useContext } from 'react';
import styled from 'styled-components';
import { FcOpenedFolder } from 'react-icons/fc';
import Image from 'next/image';
import logo from '@/assets/logo.png';
import { ModalContext } from '@/screen/Dashboard/components/Dialog_box_state';
import { PlaygroundContext } from '@/screen/Dashboard/components/DataStoreContext';
import { useRouter } from 'next/navigation';
import supabase from '@/helper/supabaseClient';
import { Tooltip } from "@mui/material";

const StyledRightComponent = styled.div`
    position: fixed;
    top: 0;
    left: 40%;
    width: 57%;
    height: 100vh;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 2rem;
    background: rgba(30, 41, 59, 0.4);
    border: 1px solid rgba(71, 85, 105, 0.3);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    position: relative;
    z-index: 5;
    box-sizing: border-box;
    &::-webkit-scrollbar {
    display: none;
  }

    @media (max-width: 768px){
        position: relative;
        width: 100%;
        padding: 1rem 0.5rem;
    }
`;

const TabsContainer = styled.div`
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid rgba(71, 85, 105, 0.3);
    padding-bottom: 1rem;
`;

const Tab = styled.div`
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    color: ${props => props.$active ? '#06b6d4' : '#cbd5e1'};
    font-weight: ${props => props.$active ? '600' : '400'};
    border-bottom: ${props => props.$active ? '2px solid #06b6d4' : '2px solid transparent'};
    transition: all 0.3s ease;
    border-radius: 8px 8px 0 0;
    background: ${props => props.$active ? 'rgba(6, 182, 212, 0.1)' : 'transparent'};

    &:hover {
        color: #06b6d4;
        background: rgba(6, 182, 212, 0.05);
    }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  margin-bottom: 1.5rem;
`;

const Heading = styled.h3`
  font-size: ${props => props.size === 'small' ? "1.25rem" : "1.75rem"};
  font-weight: 600;
  display: flex;
  align-items: center;
  color: #e2e8f0;
  gap: 0.5rem;
  span {
    font-weight: 700;
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const AddButton = styled.div`
    font-size: 1rem;
    border-radius: 12px;
    color: #e2e8f0;
    background: rgba(6, 182, 212, 0.1);
    border: 1px solid rgba(6, 182, 212, 0.3);
    padding: 0.75rem 1.5rem;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;
    gap: 0.5rem;
    font-weight: 500;
    box-shadow: 0 4px 14px rgba(6, 182, 212, 0.2);
    
    span {
        font-size: 1.25rem;
        font-weight: 700;
    }

    &:hover {
        cursor: pointer;
        transform: translateY(-2px);
        background: rgba(6, 182, 212, 0.2);
        border-color: #06b6d4;
        box-shadow: 0 8px 24px rgba(6, 182, 212, 0.3);
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
    color: black;
`;

const PlayGroundCards = styled.div`
    display: ${props => props.$isOpen ? 'grid' : 'none'};
    grid-template-columns: 1fr 1fr;
    gap: 2rem;

    @media (max-width: 428px){
        grid-template-columns: 1fr;
    }
`;

const Card = styled.div`
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 16px;
    width: 96%;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.4);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        background: rgba(15, 23, 42, 0.8);
        border-color: rgba(6, 182, 212, 0.5);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }
`;

const CardContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const CardContent = styled.div`
  color: #e2e8f0;
  
  p {
    margin: 0.25rem 0;
    font-size: 1.1rem;
    
    &:first-child {
      font-weight: 600;
      color: #cbd5e1;
    }
    
    &:last-child {
      color: #06b6d4;
      font-size: 0.8rem;
    }
  }
`;

const Logo = styled(Image)`
    width: 50px;
    height: 50px;
    margin-right: 1rem;

    @media (max-width: 425px){
        width: 50px;
        margin-right: 0.5rem;
    }
`;

const Icon = styled.span`
  transition: all 0.3s ease;
  color: #cbd5e1;
  user-select: none;
  padding: 0.5rem;
  border-radius: 8px;
  
  &:hover {
    transform: scale(1.1);
    cursor: pointer;
    color: #06b6d4;
    background: rgba(6, 182, 212, 0.1);
  }
`;

const ArrowIcon = styled.span`
  margin-left: 1rem;
  color: #cbd5e1;
  transition: all 0.3s ease;
  transform: ${props => props.$isOpen ? 'rotate(0deg)' : 'rotate(180deg)'};
  user-select: none;
  padding: 0.5rem;
  border-radius: 8px;
  
  &:hover {
    color: #06b6d4;
    background: rgba(6, 182, 212, 0.1);
  }
`;

const RightComponent = () => {
  const router = useRouter();
  const { openModal } = useContext(ModalContext);
  const { folders, deleteFolder, deleteCard } = useContext(PlaygroundContext);

  const [currentUserId, setCurrentUserId] = useState(null);
  const [openFolders, setOpenFolders] = useState({});
  const [activeTab, setActiveTab] = useState('myProjects');

  const toggleFolder = (folderId) => {
    setOpenFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    fetchUser();
  }, []);

  const check_isOwner = (ownerID) => currentUserId && String(currentUserId) === String(ownerID);

  const renderFolder = (folderId, folder, isOwner = true) => (
    <FolderCard key={folderId}>
      <Header>
        <Heading size="small" onClick={() => toggleFolder(folderId)} style={{ cursor: 'pointer' }}>
          <FcOpenedFolder /> {folder.title}
        </Heading>
        <FolderIcons>
          {isOwner && (
            <>
              <Tooltip title="Delete Project"><Icon className="material-icons" onClick={() => deleteFolder(folderId)}>delete</Icon></Tooltip>
              <Tooltip title="Edit Project"><Icon className="material-icons" onClick={() => openModal({
                show: true,
                modalType: 3,
                identifiers: { folderId, cardId: "", folderData: { title: folder.title } }
              })}>edit</Icon></Tooltip>
              <Tooltip title="Share Project"><Icon className="material-icons" onClick={() => openModal({
                show: true,
                modalType: 5,
                identifiers: { folderId, cardId: "", folderData: { TeamEmails: folder.sharedWith } }
              })}>groups</Icon></Tooltip>
              <Tooltip title="Add New File"><AddButton onClick={() => openModal({
                show: true,
                modalType: 2,
                identifiers: { folderId, cardId: "" }
              })}><span>+</span> New File</AddButton></Tooltip>
            </>
          )}
          <Tooltip title={openFolders[folderId] ? "Collapse" : "Expand"}>
            <ArrowIcon $isOpen={openFolders[folderId]} className="material-icons" onClick={() => toggleFolder(folderId)}>arrow_drop_up</ArrowIcon>
          </Tooltip>
        </FolderIcons>
      </Header>

      <PlayGroundCards $isOpen={openFolders[folderId]}>
        {Object.entries(folder.playgrounds).map(([playgroundId, playground]) => (
          <Card key={playgroundId} onClick={() => router.push(`/editor/${playgroundId}`)}>
            <CardContainer>
              <Logo src={logo} alt="logo" width={70} height={70} />
              <CardContent>
                <p>{playground.title}</p>
                <p>Language: {playground.language}</p>
              </CardContent>
            </CardContainer>
            {isOwner && (
              <FolderIcons onClick={(e) => e.stopPropagation()}>
                <Tooltip title="Delete File"><Icon className="material-icons" onClick={() => deleteCard(folderId, playgroundId)}>delete</Icon></Tooltip>
                <Tooltip title="Edit File"><Icon className="material-icons" onClick={() => openModal({
                  show: true,
                  modalType: 4,
                  identifiers: {
                    folderId,
                    cardId: playgroundId,
                    fileData: { title: playground.title, language: playground.language }
                  }
                })}>edit</Icon></Tooltip>
              </FolderIcons>
            )}
          </Card>
        ))}
      </PlayGroundCards>
    </FolderCard>
  );

  const myProjects = Object.entries(folders)
    .filter(([_, folder]) => check_isOwner(folder.owner_id));

  const sharedProjects = Object.entries(folders)
    .filter(([_, folder]) => !check_isOwner(folder.owner_id));

  return (
    <StyledRightComponent>
      <Header>
        <Heading size="large">
          Projects
        </Heading>
        <Tooltip title="Add New Project">
          <AddButton onClick={() => openModal({
            show: true,
            modalType: 1,
            identifiers: { folderId: "", cardId: "" }
          })}>
            <span>+</span> New Project
          </AddButton>
        </Tooltip>
      </Header>

      <TabsContainer>
        <Tab $active={activeTab === 'myProjects'} onClick={() => setActiveTab('myProjects')}>
          My Projects
        </Tab>
        <Tab $active={activeTab === 'sharedProjects'} onClick={() => setActiveTab('sharedProjects')}>
          Shared Projects
        </Tab>
      </TabsContainer>

      {activeTab === 'myProjects' && myProjects.map(([folderId, folder]) => renderFolder(folderId, folder, true))}
      {activeTab === 'sharedProjects' && sharedProjects.map(([folderId, folder]) => renderFolder(folderId, folder, false))}
    </StyledRightComponent>
  );
};

export default RightComponent;
