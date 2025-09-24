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

    const onChangeCode = (newCode) => {
    setCode(newCode);
  };

    useEffect(() => {
        if (FileID) {
            loadFileContent();
        }
    }, [FileID]);

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

    return (
        
        <div className="playground-container">
            <div className={`header ${theme === 'vs-light' ? 'light-theme' : 'dark-theme'}`}>
                <Image src="/logo.png" className="logo" alt="logo" width={95} height={95} priority/>
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
                    fileId={FileID}
                    onChange={onChangeCode}
                    value={code}
                />
                <div className="right-playground-container">
                    <div className="input-output-container ">
                        <div className="input-header">
                            <b>Input:</b>
                        </div>
                        <textarea id="input-textare" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter Input here" className="input-textarea"></textarea>
                        <div className="input-bottom-text">If your code takes input, add it in the above box before running.</div>
                    </div>
                
                    <div className="input-output-container">
                        <div className="output-header">
                            <div className="output-text">
                                <b>Output:</b>
                            </div>
                            <label htmlFor="output-textarea" className="icon-container exportBtn" onClick={ExportOutput}>
                            <span className="material-symbols-outlined">ios_share</span>
                            <b>Export Output</b>
                            </label>
                        </div>
                        <textarea  
                            id="output-textarea"
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