import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { ModalContext } from '../context/ModalContext';
import { PlaygroundContext } from '../context/PlaygroundContext';
import supabase from '../helper/supabaseClient';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: rgba(30, 41, 59, 0.9);
  border: 1px solid rgba(71, 85, 105, 0.4);
  backdrop-filter: blur(20px);
  padding: 2rem;
  border-radius: 16px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 16px;
    left: 16px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    box-shadow: 0 0 20px rgba(6, 182, 212, 0.6);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 16px;
    right: 16px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    box-shadow: 0 0 20px rgba(6, 182, 212, 0.6);
  }
`;

const ModalHeader = styled.h2`
  margin-bottom: 1.5rem;
  color: #e2e8f0;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Input = styled.input`
  padding: 12px 16px;
  font-size: 0.95em;
  color: #e2e8f0;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 12px;
  outline: none;
  transition: all 0.3s ease;

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
  padding: 12px 16px;
  font-size: 0.95em;
  color: #e2e8f0;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 12px;
  outline: none;
  transition: all 0.3s ease;
  cursor: pointer;

  &:focus {
    border-color: #06b6d4;
    background: rgba(15, 23, 42, 0.8);
    box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.08);
  }

  option {
    background: #1e293b;
    color: #e2e8f0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95em;
  font-weight: 600;
  transition: all 0.3s ease;
  background: ${props => props.$primary 
    ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' 
    : 'rgba(30, 41, 59, 0.6)'};
  color: ${props => props.$primary ? '#fff' : '#e2e8f0'};
  border: 1px solid ${props => props.$primary 
    ? 'transparent' 
    : 'rgba(71, 85, 105, 0.4)'};
  box-shadow: ${props => props.$primary 
    ? '0 4px 14px rgba(6, 182, 212, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.1)'};

  &:hover {
    transform: translateY(-2px);
    background: ${props => props.$primary 
      ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' 
      : 'rgba(30, 41, 59, 0.8)'};
    box-shadow: ${props => props.$primary 
      ? '0 6px 20px rgba(6, 182, 212, 0.45)' 
      : '0 4px 12px rgba(0, 0, 0, 0.2)'};
  }

  &:active {
    transform: translateY(0);
  }
`;

const Modal = () => {
  const { isOpenModal, closeModal } = useContext(ModalContext);
  const { fetchFolders } = useContext(PlaygroundContext);
  const [formData, setFormData] = useState({
    title: '',
    language: 'javascript'
  });

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
            project_name: formData.title,
            owner_id: user.id,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
      } else if (isOpenModal.modalType === 2 || isOpenModal.modalType === 3) { // New Playground
        const { error } = await supabase
          .from('File-Table')
          .insert({
            file_name: formData.title,
            extension: formData.language,
            project_id: isOpenModal.identifiers.folderId,
            content: '',
            code_path: `/${isOpenModal.identifiers.folderId}/${formData.title}.${formData.language}`,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      } else if (isOpenModal.modalType === 4) { // Edit Folder
        const { error } = await supabase
          .from('Project-Table')
          .update({ project_name: formData.title })
          .eq('project_id', isOpenModal.identifiers.folderId);

        if (error) throw error;
      } else if (isOpenModal.modalType === 5) { // Edit Playground
        const { error } = await supabase
          .from('File-Table')
          .update({ file_name: formData.title })
          .eq('file_id', isOpenModal.identifiers.cardId);

        if (error) throw error;
      }

      await fetchFolders();
      closeModal();
      setFormData({ title: '', language: 'javascript' });
    } catch (error) {
      console.log('Error:', error);
      alert('Operation failed');
    }
  };

  const getModalTitle = () => {
    switch (isOpenModal.modalType) {
      case 1: return 'Create New Folder';
      case 2: return 'Create New Playground';
      case 3: return 'Create New Playground';
      case 4: return 'Edit Folder';
      case 5: return 'Edit Playground';
      default: return 'Modal';
    }
  };

  if (!isOpenModal.show) return null;

  return (
    <ModalOverlay onClick={closeModal}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>{getModalTitle()}</ModalHeader>
        <ModalForm onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
          {(isOpenModal.modalType === 2 || isOpenModal.modalType === 3 || isOpenModal.modalType === 5) && (
            <Select
              value={formData.language}
              onChange={(e) => setFormData({...formData, language: e.target.value})}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="c">C</option>
            </Select>
          )}
          <ButtonGroup>
            <Button type="button" onClick={closeModal}>Cancel</Button>
            <Button type="submit" $primary>Save</Button>
          </ButtonGroup>
        </ModalForm>
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;
