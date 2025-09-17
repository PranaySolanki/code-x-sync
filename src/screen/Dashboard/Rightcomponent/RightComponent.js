import React, { useContext } from 'react';
import styled from 'styled-components';
import { FcOpenedFolder } from 'react-icons/fc';
import Image from 'next/image';
import logo from '@/assets/logo.png';
import { ModalContext } from '@/screen/Dashboard/components/Dialog_box_state';
import { PlaygroundContext } from '@/screen/Dashboard/components/DataStoreContext';
import { useRouter } from 'next/navigation';

const StyledRightComponent = styled.div`
    position: fixed;
    top: 0;
    left: 40%;
    width: 57%;
    padding: 2rem;
    background-color: white;

    @media (max-width: 768px){
        position: relative;
        width: 100%;
        padding: 1rem 0.5rem;
    }
        
`;


const Header = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #989898;
  margin-bottom: 1rem;
`;

const Heading = styled.h3`
  font-size: ${props => props.size === 'small' ? "1.25rem" : "1.75rem"};
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  span{
    font-weight: 700;
  }
`;

const AddButton = styled.div`
    font-size: 1rem;
    border-radius: 30px;
    color: black;
    display: flex;
    align-items: center;
    transition: transform 0.3s ease-in-out;
    gap: 0.25rem;
    span{
        font-size: 1.5rem;
        font-weight: 700;
    }

    &:hover{
        cursor: pointer;
        transform: scale(1.1);
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
`;

const PlayGroundCards = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;

    @media (max-width: 428px){
        grid-template-columns: 1fr;
    }
`;

const Card = styled.div`
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 8px;
    width: 96%;
    box-shadow: 2px 2px 5px gray;
    cursor: pointer;
    transition: all 0.5s ease-in-out;

    &:hover{
      scale: 1.02;
      outline: 2px solid white;
      box-shadow: 10px 10px 5px gray;
      transition: all 0.3s ease-in-out;
    }
`;

const CardContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const CardContent = styled.div`
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
  transition: transform 0.3s ease-in-out;
  &:hover {
    transform: scale(1.2);
    cursor: pointer;
  }
`;

const RightComponent = () => {
  const router = useRouter();

  const { openModal } = useContext(ModalContext);
  const { folders, deleteFolder, deleteCard } = useContext(PlaygroundContext);

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
        })}> <span>+</span>New Project</AddButton>
      </Header>

      {
        Object.entries(folders).map(([folderId, folder]) => (
          <FolderCard key={folderId}>
            <Header>
              <Heading size="small">
                <FcOpenedFolder /> {folder.title}
              </Heading>
              <FolderIcons>
                <Icon className="material-icons" onClick={() => deleteFolder(folderId)}>delete</Icon>
                <Icon className="material-icons" onClick={() => openModal({
                  show: true,
                  modalType: 3,
                  identifiers: {
                    folderId: folderId,
                    cardId: "",
                    folderData: { ProjectTitle: folder.title }
                  }
                })} >edit</ Icon>

                <Icon className="material-icons" onClick={() => openModal({
                  show: true,
                  modalType: 5,
                  identifiers: { folderId: folderId, 
                    cardId: "", 
                    folderData: { TeamEmails : folder.sharedWith || [] }
                  }
                })} >groups</Icon>
                
                <AddButton onClick={() => openModal({
                  show: true,
                  modalType: 2,
                  identifiers: {
                    folderId: folderId,
                    cardId: "",
                  }
                })}><span>+</span> New File</AddButton>
              </FolderIcons>
            </Header>

            <PlayGroundCards>
              {
                Object.entries(folder.playgrounds).map(([playgroundId, playground]) => (
                  <Card key={playgroundId} onClick={() => {
                    router.push(`/editor/${playgroundId}`);
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
                      <Icon className="material-icons" onClick={() => deleteCard(folderId, playgroundId)} >delete</Icon>
                      <Icon className="material-icons" onClick={() => openModal({
                        show: true,
                        modalType: 4,
                        identifiers: {
                          folderId: folderId,
                          cardId: playgroundId,
                          fileData: { title: playground.title, language: playground.language }
                        }
                      })} >edit</Icon>
                    </FolderIcons>
                  </Card>
                ))
              }
            </PlayGroundCards>
          </FolderCard>
        ))
      }
    </StyledRightComponent>
  );
};

export default RightComponent;
