'use client';
import "./index.scss"
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import supabase from "@/helper/supabaseClient";

const RightComponent = () => {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            
            if (authError || !user) {
                router.push('/login');
                return;
            }

            const { data: projectsData, error: projectsError } = await supabase
                .from('Project-Table')
                .select('*')
                .eq('owner_id', user.id);

            if (projectsError) throw projectsError;

            const projectsWithFiles = await Promise.all(projectsData.map(async (project) => {
                const { data: files, error: filesError } = await supabase
                    .from('File-Table')
                    .select('*')
                    .eq('project_id', project.project_id);

                if (filesError) throw filesError;

                return {
                    ...project,
                    files: files || []
                };
            }));

            setProjects(projectsWithFiles);
        } catch (error) {
            console.error('Error fetching projects:', error);
            alert('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const renameProject = async (projectId, currentName) => {
        const newName = prompt("Enter new project name:", currentName);
        if (newName && newName !== currentName) {
            try {
                // Update without trying to return the updated record
                const { error } = await supabase
                    .from('Project-Table')
                    .update({ project_name: newName })
                    .eq('project_id', projectId);

                if (error) {
                    throw new Error(error.message);
                }
                
                // Refresh projects list after successful update
                await fetchProjects();
                
            } catch (error) {
                console.error('Error renaming project:', error);
                alert('Failed to rename project: ' + error.message);
            }
        }
    };

    const deleteProject = async (projectId) => {
        if (confirm("Are you sure you want to delete this project? All files will be deleted.")) {
            try {
                // First delete all files in the project
                const { error: filesError } = await supabase
                    .from('File-Table')
                    .delete()
                    .eq('project_id', projectId);

                if (filesError) {
                    throw new Error('Failed to delete project files: ' + filesError.message);
                }

                // Then delete the project
                const { error: projectError } = await supabase
                    .from('Project-Table')
                    .delete()
                    .eq('project_id', projectId)
                    .single();

                if (projectError) {
                    throw new Error('Failed to delete project: ' + projectError.message);
                }

                // Refresh the projects list
                await fetchProjects();
                
            } catch (error) {
                console.error('Error deleting project:', error);
                alert(error.message);
            }
        }
    };

    const createNewFile = async (projectId) => {
        const fileName = prompt("Enter file name:");
        const language = prompt("Enter language (java/python/javascript/c):");
        
        if (fileName && language) {
            try {
                // Create default file path based on project and filename
                const defaultPath = `/${projectId}/${fileName}.${language.toLowerCase()}`;
                
                const { data: newFile, error: fileError } = await supabase
                    .from('File-Table')
                    .insert({
                        file_name: fileName,
                        extension: language.toLowerCase(),
                        project_id: projectId,
                        content: '',
                        code_path: defaultPath, // Set a default path instead of empty string
                        updated_at: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (fileError) {
                    // Handle specific error cases
                    const errorMessage = fileError?.message || 'Unknown error occurred';
                    throw new Error(`Failed to create file: ${errorMessage}`);
                }

                await fetchProjects();

            } catch (error) {
                // More descriptive error handling
                const errorMessage = error?.message || 'Unknown error occurred';
                console.error('Error details:', error); // For debugging
                alert(errorMessage); // User-friendly message
            }
        }
    };

    const openFile = (fileId, fileName, extension) => {
        router.push(`/playground?fileId=${fileId}&fileName=${fileName}&language=${extension}`);
    };

    if (loading) {
        return <div className="right-container">Loading...</div>;
    }

    return (
        <div className="right-container">
            <div className="header">
                <div className="title"><span>MY</span> Projects</div>
            </div>
            {projects.map(project => (
                <div key={project.project_id} className="project-container">
                    <div className="project-header">
                        <div className="project-header-left">
                            <span className="material-icons" style={{color:"#FFCA29"}}>folder</span>
                            <span>{project.project_name}</span>
                        </div>
                        <div className="project-header-right">
                            <button onClick={() => deleteProject(project.project_id)} title="Delete Project">
                                <span className="material-icons">delete</span>
                            </button>
                            <button onClick={() => renameProject(project.project_id, project.project_name)} title="Rename Project">
                                <span className="material-icons">edit</span>
                            </button>
                            <button onClick={() => alert('Share project feature coming soon')} title="Share Project">
                                <span className="material-icons">group</span>
                            </button>
                            <button onClick={() => createNewFile(project.project_id)} className="new-file-btn" title="Add New File">
                                <span>+ New File</span>
                            </button>
                        </div>
                    </div>
                    <div className="files-container">
                        <div className="cards-container">
                            {project.files.map(file => (
                                <div key={file.file_id} className="card" 
                                    onClick={() => openFile(file.file_id, file.file_name, file.extension)}>
                                    <Image src="/logo.png" alt="logo" width={50} height={50}/>
                                <div className="title-container">
                                    <span>{file.file_name}</span>
                                    <span>Language: {file.extension}</span>
                                </div>
                                <div className="file-actions">
                                    <button onClick={(e) => { e.stopPropagation(); alert('Delete file feature coming soon'); }} title="Delete File">
                                        <span className="material-icons">delete</span>
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); alert('Edit file feature coming soon'); }} title="Edit File">
                                        <span className="material-icons">edit</span>
                                    </button>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RightComponent;