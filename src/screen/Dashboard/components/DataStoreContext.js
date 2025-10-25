import React, { createContext, useState, useEffect, use } from 'react';
import supabase from '@/helper/supabaseClient';

export const PlaygroundContext = createContext();

export const PlaygroundProvider = ({ children }) => {
  const [folders, setFolders] = useState({});

  useEffect(() => {
    fetchFolders();
    
    // Refresh data when user returns to dashboard from playground
    const handleFocus = () => {
      fetchFolders();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchFolders = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return;
      }

      const { data: projectsData, error: projectsError } = await supabase
        .from('Project-Table')
        .select('*')
        .or(`owner_id.eq.${user.id},team_email.cs.{${user.email}}`);

      if (projectsError) throw projectsError;

      const foldersObj = {};
      await Promise.all(projectsData.map(async (project) => {
        const { data: files, error: filesError } = await supabase
          .from('File-Table')
          .select('*')
          .eq('project_id', project.project_id);

        if (filesError) throw filesError;

        foldersObj[project.project_id] = {
          title: project.project_name,
          owner_id: project.owner_id,
          sharedWith: project.team_email,
          playgrounds: files.reduce((acc, file) => {
            acc[file.file_id] = {
              title: file.file_name,
              language: file.extension
            };
            return acc;
          }, {})
        };
      }));

      setFolders(foldersObj);
    } catch (error) {
      console.log('Error fetching folders:', error);
    }
  };

  const deleteFolder = async (folderId) => {
    if (confirm("Are you sure you want to delete this project? All files related to this project will be deleted.")) {
      try {
        // Delete all files first
        const { error: filesError } = await supabase
          .from('File-Table')
          .delete()
          .eq('project_id', folderId);

        if (filesError) throw filesError;

        // Delete project
        const { error: projectError } = await supabase
          .from('Project-Table')
          .delete()
          .eq('project_id', folderId);

        if (projectError) throw projectError;

        await fetchFolders();
      } catch (error) {
        console.log('Error deleting folder:', error);
        alert('Failed to delete folder');
      }
    }
  };

  const deleteCard = async (folderId, cardId) => {
    if (confirm("Are you sure you want to delete this file?")) {
      try {
        const { error } = await supabase
          .from('File-Table')
          .delete()
          .eq('file_id', cardId);

        if (error) throw error;

        await fetchFolders();
      } catch (error) {
        console.log('Error deleting file:', error);
        alert('Failed to delete file');
      }
    }
  };

  return (
    <PlaygroundContext.Provider value={{ folders, deleteFolder, deleteCard, fetchFolders }}>
      {children}
    </PlaygroundContext.Provider>
  );
};
