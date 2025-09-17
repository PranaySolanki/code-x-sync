'use client';
import React, { useContext, useState,useEffect } from 'react';
import styled from 'styled-components';
import { ModalContext } from './Dialog_box_state';
import { PlaygroundContext } from './DataStoreContext';
import supabase from '../../../helper/supabaseClient';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
`;

const ModalHeader = styled.h2`
  margin-bottom: 1rem;
`;

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${props => props.$save ? '#4a67c0ff' : '#6c757d'};
  color: white;

  &:hover {
    opacity: 0.8;
  }
    &:disabled {
    cursor: not-allowed;
    background-color: #ccc;
  }
`;

const EmailList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
`;

const EmailTag = styled.div`
  background-color: #e0e0e0;
  padding: 4px 8px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  width: fit-content;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 8px;
  font-weight: bold;
  color: #555;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  .addEmailBtn {
    background-color: #4a67c0ff;
    margin-left: 8px;
    }
    .emailInput {
      flex: 1;
    }
`;


const Modal = () => {
  const { isOpenModal, closeModal } = useContext(ModalContext);
  const { fetchFolders } = useContext(PlaygroundContext);
  const [formData, setFormData] = useState({
    ProjectTitle: '',
    FileTitle: '',
    language: 'c' 
  });

  const [sharedEmails, setSharedEmails] = useState(isOpenModal.identifiers.folderData.TeamEmails);
  const [emailInput, setEmailInput] = useState('');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    if (isOpenModal.show && isOpenModal.modalType === 4 && isOpenModal.identifiers.fileData) {
      setFormData({
        FileTitle: isOpenModal.identifiers.fileData.title || '',
        language: isOpenModal.identifiers.fileData.language || 'c'
      });
    }
    else if (isOpenModal.show && isOpenModal.modalType === 3 && isOpenModal.identifiers.folderData) {
      setFormData({
        ProjectTitle: isOpenModal.identifiers.folderData.title || '',
      });
    }if (isOpenModal.show && isOpenModal.modalType === 5 && isOpenModal.identifiers.folderData) {
      if(!isOpenModal.identifiers.folderData.TeamEmails) {
        setSharedEmails([]);
      }
    }
    else {
      // Reset form for other modal types or when closed
      setFormData({
        ProjectTitle: '',
        FileTitle: '',
        language: 'c'
      });
    }
  }, [isOpenModal]);

 const isFormChanged = React.useMemo(() => {
    if (isOpenModal.modalType === 4 && isOpenModal.identifiers.fileData) {
      const originalTitle = isOpenModal.identifiers.fileData.title || '';
      const originalLanguage = isOpenModal.identifiers.fileData.language || 'c';
      return formData.FileTitle !== originalTitle || formData.language !== originalLanguage;
    }
    if (isOpenModal.modalType === 3 && isOpenModal.identifiers.folderData) {
      const originalTitle = isOpenModal.identifiers.folderData.title || '';
      return formData.ProjectTitle !== originalTitle;
    }
    if (isOpenModal.modalType === 5) {
      return true;
    }
     
    // For other modal types, the form is always "changed" when a new value is entered
    return formData.ProjectTitle.length > 0 || formData.FileTitle.length > 0;
  }, [formData, isOpenModal]);


   const handleAddEmail = (e) => {
    e.preventDefault();
    if (!emailInput) {
        alert("Please enter an email address.");
        return;
    }
    if (!emailRegex.test(emailInput)) {
        alert("Please enter a valid email address.");
        return;
    }
    if (sharedEmails.includes(emailInput)) {
        alert("This email has already been added.");
        return;
    }
    setSharedEmails([...sharedEmails, emailInput]);
    setEmailInput('');
  };

  const handleRemoveEmail = (emailToRemove) => {
    setSharedEmails(sharedEmails.filter(email => email !== emailToRemove));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        alert('Authentication required');
        return;
      }

      if (isOpenModal.modalType === 1) { // New Folder
        const { error } = await supabase
          .from('Project-Table')
          .insert({
            project_name: formData.ProjectTitle,
            owner_id: user.id,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
      } else if (isOpenModal.modalType === 2 ) { // New File
        const { error } = await supabase
          .from('File-Table')
          .insert({
            file_name: formData.FileTitle,
            extension: formData.language,
            project_id: isOpenModal.identifiers.folderId,
            content: '',
            code_path: `/${isOpenModal.identifiers.folderId}/${formData.title}.${formData.language}`,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      } else if (isOpenModal.modalType === 3) { // Edit Folder
        const { error } = await supabase
          .from('Project-Table')
          .update({ 
            project_name: formData.ProjectTitle,
            updated_at: new Date().toISOString() 
          })
          .eq('project_id', isOpenModal.identifiers.folderId);

        if (error) throw error;
      } else if (isOpenModal.modalType === 4 && (title!=formData.title || language!= formData.language)) { // Edit File
        const { error } = await supabase
          .from('File-Table')
          .update({ 
            file_name: formData.FileTitle ,
            updated_at: new Date().toISOString(),
            extension: formData.language
          })
          .eq('file_id', isOpenModal.identifiers.cardId);

        if (error) throw error;
      }else if (isOpenModal.modalType === 5) { // Share Project
        const emailsToSave = sharedEmails.length > 0 ? sharedEmails : null;
        
        const { error } = await supabase
          .from('Project-Table')
          .update({ team_email: emailsToSave })
          .eq('project_id', isOpenModal.identifiers.folderId);

        if (error) {
          console.log('Error sharing project:', error);
          alert('Failed to share project');
          return;
        }
        console.log('Sharing project with:', sharedEmails);
        // Implement Supabase logic to share the project with the list of emails.
      }

      await fetchFolders();
      closeModal();
      setFormData({ FileTitle: '',ProjectTitle: '', language: 'c' });
    } catch (error) {
      console.log('Error:', error);
      alert('Operation failed');
    }
  };

  const getModalTitle = () => {
    switch (isOpenModal.modalType) {
      case 1: return 'Create New Project';
      case 2: return 'Create New File';
      case 3: return 'Edit Project Name';
      case 4: return 'Edit File';
      case 5: return 'Share Project';
      default: return 'Modal';
    }
  };

  if (!isOpenModal.show) return null;

  return (
    <ModalOverlay onClick={closeModal}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>{getModalTitle()}</ModalHeader>
        <ModalForm onSubmit={handleSubmit}>

          {(isOpenModal.modalType === 1 || isOpenModal.modalType === 3  ) &&(
            <Input
            type="text"
            placeholder="Title"
            value={formData.ProjectTitle}
            onChange={(e) => setFormData({...formData, ProjectTitle: e.target.value})}
            required
          />
          ) }
          
          {(isOpenModal.modalType === 2 || isOpenModal.modalType === 4) && (

            <><Input
              type="text"
              placeholder="Title"
              value={formData.FileTitle}
              onChange={(e) => setFormData({ ...formData, FileTitle: e.target.value })}
              required />
              
              <Select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="c">C</option>
              </Select></>
          )}

          {isOpenModal.modalType === 5 && (
            <>
              <InputContainer>
                <Input
                  type="email"
                  className='emailInput'
                  placeholder="Enter email to share"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddEmail(e);
                    }
                  }}
                />
                <Button type="button" className='addEmailBtn' onClick={handleAddEmail}>Add</Button>
              </InputContainer>
              <EmailList>
                {sharedEmails.map(email => (
                  <EmailTag key={email}>
                    {email}
                    <RemoveButton type="button" onClick={() => handleRemoveEmail(email)}>x</RemoveButton>
                  </EmailTag>
                ))}
              </EmailList>
            </>
          )}

          <ButtonGroup>
            <Button type="button" onClick={closeModal} >Cancel</Button>
            <Button type="submit" $save disabled={!isFormChanged}>Save</Button>
          </ButtonGroup>
        </ModalForm>
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;
