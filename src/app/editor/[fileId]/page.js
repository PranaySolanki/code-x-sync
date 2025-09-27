'use client';
import "@/screen/EditorScreen/index.scss"
import React, { useState, useEffect } from 'react';
import EditorContainer from "@/screen/EditorScreen/EditorContainer.js";
import Image from 'next/image';
import { useParams } from 'next/navigation';
import supabase from "@/helper/supabaseClient";

const PlaygroundScreen = () => {
    const searchParams = useParams();
    const FileID = searchParams.fileId;
    
    const [output, setOutput] = useState('');
    const [input, setInput] = useState('');
    const [theme, setTheme] = useState("vs-light");
    const [code, setCode] = useState('');
    const [title, setTitle] = useState("Untitled");
    const [language, setLanguage] = useState('c');
    const [authorized, setAuthorized] = useState(null); // null = loading, true = allowed, false = not allowed
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        if (FileID) {
            checkAuthorization();
        }
    }, [FileID]);

    const checkAuthorization = async () => {
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            setAuthorized(false);
            return;
        }

        // Get file info (to get project_id)
        const { data: fileData, error: fileError } = await supabase
            .from('File-Table')
            .select('project_id')
            .eq('file_id', FileID)
            .single();

        if (fileError || !fileData) {
            setAuthorized(false);
            return;
        }

        // Get project info (to get owner and team_email)
        const { data: projectData, error: projectError } = await supabase
            .from('Project-Table')
            .select('owner_id, team_email')
            .eq('project_id', fileData.project_id)
            .single();

        if (projectError || !projectData) {
            setAuthorized(false);
            return;
        }

        // Check if user is owner or in team_email
        const isOwnerCheck = user.id === projectData.owner_id;
        setIsOwner(isOwnerCheck);
        let isTeam = false;
        if (Array.isArray(projectData.team_email)) {
            isTeam = projectData.team_email.includes(user.email);
        } else if (typeof projectData.team_email === 'string') {
            // If stored as comma-separated string
            isTeam = projectData.team_email.split(',').map(e => e.trim()).includes(user.email);
        }

        if (isOwnerCheck || isTeam) {
            setAuthorized(true);
            loadFileContent();
        } else {
            setAuthorized(false);
        }
    };

    const loadFileContent = async () => {
        // Load file content from database
        const { data, error } = await supabase
            .from('File-Table')
            .select('content, file_name, extension')
            .eq('file_id', FileID)
            .single();
        
        if (data) {
            setCode(data.content);
            setTitle(data.file_name);
            setLanguage(data.extension);
        }
        else if (error) {
            console.log('Error loading file content:', error);
        }
    };

    const saveCode = async (newCode) => {
        if (FileID) {
            const { data, error } = await supabase
                .from('File-Table')
                .update({ content: newCode, updated_at: new Date() })
                .eq('file_id', FileID);
        }
    };

    const saveTitle = async (newTitle) => {
        setTitle(newTitle);
        if (FileID) {
            const { data, error } = await supabase
                .from('File-Table')
                .update({ file_name: newTitle ,updated_at: new Date()})
                .eq('file_id', FileID);
        }
    };

    const ExportOutput = () => {
        const outputText = output.text;
        if(!outputText || outputText===""){
            alert("The Output is empty! Run the code to export!")
        }
        else{
            const codeBlob  = new Blob([outputText], {type:"text/plain"});

            //create downloadable link 
            const downloadURL = URL.createObjectURL(codeBlob);

            const link = document.createElement("a");
            link.href = downloadURL;

            link.download = `output.txt`
            link.click();
        }
    }

    if (authorized === null) {
        return <div style={{textAlign: "center", marginTop: "3rem"}}>Loading...</div>;
    }

    if (authorized === false) {
        return <div style={{textAlign: "center", marginTop: "3rem", color: "red", fontWeight: "bold"}}>You are not authorized to access this file.</div>;
    }

    return (
        
        <div className="playground-container">
            <div className={`header ${theme === 'vs-light' ? 'light-theme' : 'dark-theme'}`}>
                <Image src="/logo.png" className="logo" alt="logo" width={95} height={95}/>
                <span className="beside-logo">CodeXSync</span>
            </div>

            <div className={`content-container ${theme === 'vs-light' ? 'light-theme' : 'dark-theme'}`}>
                <EditorContainer 
                    theme={theme} 
                    setTheme={setTheme} 
                    onCodeRun={setOutput} 
                    input={input}
                    code={code}
                    code_language={language}
                    onCodeChange={saveCode}
                    fileName={title}
                    onTitleChange={saveTitle}
                    isOwner={isOwner}
                    fileID={FileID}
                />
                <div className="right-playground-container">
                    <div className="input-output-container input-section">
                        <div className="input-header">
                            <b>Input:</b>
                        </div>
                        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter Input here" className="input-textarea"></textarea>
                        <div className="input-bottom-text">If your code takes input, add it in the above box before running.</div>
                    </div>
                
                    <div className="input-output-container output-section">
                        <div className="output-header">
                            <div className="output-text">
                                <b>Output:</b>
                            </div>
                            <label htmlFor="output-file-export" className="icon-container exportBtn" onClick={ExportOutput}>
                            <span className="material-symbols-outlined">ios_share</span>
                            <b>Export Output</b>
                            </label>
                        </div>
                        <textarea  
                            className={output.isError ? "error-text" : "output-textarea"} 
                            value={output.text} 
                            readOnly>
                        </textarea>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaygroundScreen;
