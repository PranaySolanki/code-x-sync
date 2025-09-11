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
  background-color: ${props => props.$primary ? '#007bff' : '#6c757d'};
  color: white;

  &:hover {
    opacity: 0.8;
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
