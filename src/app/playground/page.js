'use client';
import "@/screen/playgroundscreen/index.scss"
import React, { useState, useEffect } from 'react';
import EditorContainer from "@/screen/playgroundscreen/EditorContainer.js";
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import supabase from "@/helper/supabaseClient";

const PlaygroundScreen = () => {
    const searchParams = useSearchParams();
    const fileId = searchParams.get('fileId');
    const fileLanguage = searchParams.get('language');

    const fileNameParam = searchParams.get('fileName');

    const [output, setOutput] = useState('');
    const [input, setInput] = useState('');
    const [theme, setTheme] = useState("vs-light");
    const [code, setCode] = useState('');
    const [title, setTitle] = useState(fileNameParam || "Untitled");

    useEffect(() => {
        console.log('PlaygroundScreen mounted with fileId:', fileId);
        if (fileId) {
            loadFileContent();
        }
    }, [fileId]);

    const loadFileContent = async () => {
        try {
            console.log('Loading file content for fileId:', fileId);
            // Load file content from database
            const { data, error } = await supabase
                .from('File-Table')
                .select('content')
                .eq('file_id', fileId)
                .single();
            
            if (error) {
                console.error('Error loading file content:', error);
            } else if (data) {
                console.log('Loaded file content:', data.content);
                setCode(data.content || '');
            }
        } catch (error) {
            console.error('Error loading file content:', error);
        }
    };

    const saveCode = async (newCode) => {
        // This function is now only used for real-time updates, not for saving
        // The actual saving is handled by the manual save button in EditorContainer
        setCode(newCode);
    };

    const saveTitle = async (newTitle) => {
        setTitle(newTitle);
        if (fileId) {
            const { data, error } = await supabase
                .from('File-Table')
                .update({ file_name: newTitle })
                .eq('file_id', fileId);
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
                    code_language={fileLanguage?.toLowerCase()}
                    onCodeChange={saveCode}
                    fileName={title}
                    onTitleChange={saveTitle}
                    fileID={fileId}
                    isOwner={true}
                />
                <div className="right-playground-container">
                    <div className="input-output-container ">
                        <div className="input-header">
                            <b>Input:</b>
                        </div>
                        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter Input here" className="input-textarea"></textarea>
                        <div className="input-bottom-text">If your code takes input, add it in the above box before running.</div>
                    </div>
                
                    <div className="input-output-container">
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
