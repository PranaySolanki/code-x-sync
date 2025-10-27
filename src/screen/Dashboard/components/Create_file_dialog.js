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
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(7px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 2rem;
  border-radius: 24px;
  width: 450px;
  max-width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: slideIn 0.3s ease-out;
  
  // Decorative corner dots
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    box-shadow: 0 0 20px rgba(6, 182, 212, 0.6);
  }

  &::before {
    top: 24px;
    left: 24px;
  }

  &::after {
    top: 24px;
    right: 24px;
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const ModalHeader = styled.h2`
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
`;

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Input = styled.input`
  padding: 14px 16px;
  font-size: 0.95em;
  color: #e2e8f0;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 12px;
  outline: none;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;

  &::placeholder {
    color: #64748b;
  }

  &:focus {
    border-color: #06b6d4;
    background: rgba(15, 23, 42, 0.8);
    box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.08);
  }
`;

const Select = styled.select`
  padding: 14px 16px;
  font-size: 0.95em;
  color: #e2e8f0;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 12px;
  outline: none;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;

  &:focus {
    border-color: #06b6d4;
    background: rgba(15, 23, 42, 0.8);
    box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.08);
  }

  option {
    background: rgba(15, 23, 42, 0.9);
    color: #e2e8f0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95em;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 100px;
  
  ${props => props.$save ? `
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    color: #fff;
    box-shadow: 0 4px 14px rgba(6, 182, 212, 0.3);
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(6, 182, 212, 0.45);
    }
  ` : `
    background: rgba(51, 65, 85, 0.5);
    border: 1px solid rgba(71, 85, 105, 0.6);
    color: #e2e8f0;
    
    &:hover {
      background: rgba(51, 65, 85, 0.8);
      border-color: rgba(100, 116, 139, 1);
      transform: translateY(-2px);
    }
  `}

  &:disabled {
    cursor: not-allowed;
    background: rgba(51, 65, 85, 0.3);
    color: #64748b;
    transform: none;
    box-shadow: none;
  }
`;

const EmailList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  max-height: 200px;
  overflow-y: auto;
`;

const EmailTag = styled.div`
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.3);
  padding: 8px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  width: fit-content;
  color: #06b6d4;
  font-size: 0.9em;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(6, 182, 212, 0.2);
    border-color: #06b6d4;
  }
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 8px;
  font-weight: bold;
  color: #06b6d4;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  
  .addEmailBtn {
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    color: #fff;
    border: none;
    padding: 12px 20px;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 14px rgba(6, 182, 212, 0.3);
    white-space: nowrap;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(6, 182, 212, 0.45);
    }
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

  const [sharedEmails, setSharedEmails] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    if (isOpenModal.show) {
      if (isOpenModal.show && isOpenModal.modalType === 4 && isOpenModal.identifiers.fileData) {
        setFormData({
          FileTitle: isOpenModal.identifiers.fileData.title,
          language: isOpenModal.identifiers.fileData.language || 'c'
        });
      }
      else if (isOpenModal.show && isOpenModal.modalType === 3 && isOpenModal.identifiers.folderData) {
        setFormData({
          ProjectTitle: isOpenModal.identifiers.folderData.title || '',
        });
      }
      else if (isOpenModal.show && isOpenModal.modalType === 5 && isOpenModal.identifiers.folderData) {
          setSharedEmails(isOpenModal.identifiers.folderData.TeamEmails || [] );
        }
    }
    
  
    else {
      // Reset form for other modal types or when closed
      setFormData({
        ProjectTitle: '',
        FileTitle: '',
        language: 'c',
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

      const originalData = isOpenModal.identifiers.fileData;

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
      } else if (isOpenModal.modalType === 4) { // Edit File

        if (originalData && (formData.FileTitle !== originalData.title || formData.language !== originalData.language)) {
        const { error } = await supabase
          .from('File-Table')
          .update({ 
            file_name: formData.FileTitle ,
            updated_at: new Date().toISOString(),
            extension: formData.language
          })
          .eq('file_id', isOpenModal.identifiers.cardId);

        if (error) throw error;
      }
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
