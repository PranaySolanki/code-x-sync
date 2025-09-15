'use client';
import { useRef, useState, useEffect } from "react";
import "./EditorContainer.scss"
import Editor from "@monaco-editor/react";
import  executeCode  from "./CompilerAPI";
import { Tooltip } from "@mui/material";

const EditorContainer = ({ onCodeRun, input, theme, setTheme, fileName, onTitleChange,code_language }) => {

    const [code, setCode] = useState('');
    const [language, setLanguage] = useState(code_language || "c");
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleInput, setTitleInput] = useState(fileName || "Untitled");
    const [isProcessing, setIsProcessing] = useState(false);

    const codeRef = useRef();

    useEffect(() => {
        setTitleInput(fileName || "Untitled");
    }, [fileName]);

    const onChangeCode = (newCode) => {
        codeRef.current = newCode;
    }

    const fileExtensionMapping = {
        c: 'c',
        java: 'java',
        python:'py',
        javascript: 'js'

    }

    const exportCode = () => {
        const codeValue = codeRef.current?.trim();
        if(!codeValue){
            alert("Please type some code in the editor before exporting.")
        }
        else{
            // create  a blob or an instant temporary file in the memory
            const codeBlob  = new Blob([codeValue], {type:"text/plain"});

            //create downloadable link 
            const downloadURL = URL.createObjectURL(codeBlob);

            const link = document.createElement("a");
            link.href = downloadURL;

            link.download = `code.${fileExtensionMapping[language]}`
            link.click();
        }
        
    }

    const ImportCode = (event) => {
        const file = event.target.files[0];
        const fileType = file.type.includes("text")
        if(fileType){
            const fileReader = new FileReader();
            fileReader.readAsText(file)
            fileReader.onload = function(value){
                const importedCode = value.target.result;
                setCode(importedCode);
                codeRef.current = importedCode;
            }

        }
        else{
            alert("Please choose program file")
        }
    }

    const onChangeLanguage = (event) => {
        setLanguage(event.target.value);

    }

    const onChangeTheme = () => {
        setTheme(theme === 'vs-light' ? 'vs-dark' : 'vs-light');
    }
   

    const fullscreen = () => {

    }

    const RunCode = async() => {
    const sourceCode = codeRef.current;
    if (!sourceCode){
        onCodeRun({ text: "", isError: false });
        alert("Please write some code to run!")
        return;
    }
    setIsProcessing(true);
    onCodeRun({ text: "Processing Please Wait!...", isError: false });
    try {
      const { run: result } = await executeCode(language, sourceCode, input);

      if (result.stderr) {
                onCodeRun({ text: result.stderr, isError: true });
            } else {
                onCodeRun({ text: result.stdout, isError: false });
            }

        } catch (error) {
            console.error(error);
            onCodeRun({ text: "Failed to connect to the API or an error occurred.", isError: true });
        } finally {
            setIsProcessing(false); 
        }
  };


    return(
        <div className="root-editor-container" >
            <div className={`editor-header ${theme === 'vs-light' ? 'light-theme' : 'dark-theme'}`}>
                <div className="editor-left-container">
                    <a href="/dashboard">
                        <Tooltip title="Back to Dashboard" placement="bottom" arrow enterDelay={100} leaveDelay={0}>
                            <span className="material-symbols-outlined back-to-dashboard">arrow_back</span> 
                        </Tooltip>
                    </a>
                    
                    {isEditingTitle ? (
                        <input
                            type="text"
                            value={titleInput}
                            onChange={(e) => setTitleInput(e.target.value)}
                            onBlur={() => {
                                onTitleChange(titleInput);
                                setIsEditingTitle(false);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    onTitleChange(titleInput);
                                    setIsEditingTitle(false);
                                } else if (e.key === 'Escape') {
                                    setTitleInput(fileName || "Untitled");
                                    setIsEditingTitle(false);
                                }
                            }}
                            className="title-input"
                            autoFocus
                        />
                    ) : (
                        <b className="title" onClick={() => setIsEditingTitle(true)}>{fileName || "Untitled"}</b>
                    )}
                    <span className="material-icons" onClick={() => setIsEditingTitle(true)}>edit</span>
                    <button className="saveBtn" disabled={isProcessing} onClick={() => onTitleChange(titleInput)}>Save Code</button>
                </div>

                <div className="editor-right-container">
                    <Tooltip title="Full Screen" placement="bottom" arrow enterDelay={100} leaveDelay={0}>
                        <button className="btn" onClick={fullscreen} disabled={isProcessing} >
                            <span className="material-symbols-outlined">fullscreen</span>
                        </button>
                    </Tooltip>
                <Tooltip title="Upload Code" placement="bottom" arrow enterDelay={100} leaveDelay={0}>  
                    <label htmlFor="import-code" className="btn" disabled={isProcessing} >
                    <span className="material-symbols-outlined">file_upload</span>
                    </label>
                    <input type="file" id="import-code" style={{display: "none"}} onChange={ImportCode} disabled={isProcessing}/>
                </Tooltip>

                <Tooltip title="Download Code" placement="bottom" arrow enterDelay={100} leaveDelay={0}>
                    <button className="btn" onClick={exportCode} disabled={isProcessing} >
                        <span className="material-symbols-outlined" >file_download</span>
                    </button>
                </Tooltip>


                    <select onChange={onChangeLanguage} value={language} disabled={isProcessing}>
                        <option value="c">C</option>
                        <option value="java">Java</option>
                        <option value="javascript">Javascript</option>
                        <option value="python">Python</option>
                    </select>

                    <button onClick={onChangeTheme} className="theme-toggle-btn" disabled={isProcessing}>
                        {theme === 'vs-light' ? (
                            <Tooltip title="Dark Mode" placement="bottom" arrow enterDelay={100} leaveDelay={0}>
                                <span className="material-symbols-outlined dark">dark_mode</span>
                            </Tooltip>
                        ) : (
                            <Tooltip title="Light Mode" placement="bottom" arrow enterDelay={100} leaveDelay={0}>
                                <span className="material-symbols-outlined light">light_mode</span>
                            </Tooltip>
                        )}
                     </button>

                </div>
            </div>
            <div className="editor-body">
                <Editor
                    width={"100%"}
                    height={"100%"}
                    language={language}
                    theme={theme}
                    options={{
                        minimap:{
                            enabled: false
                        },
                        overviewRulerLables: false,
                        glyphMargin: false,
                        hideCursorInOverviewRuler: true,
                        scrollBeyondLastLine: false,
                        readOnly: isProcessing 
                    }}
                    onChange={onChangeCode}
                    value={code}
                />
            </div>
            <div className={`editor-footer ${theme === 'vs-light' ? 'light-theme' : 'dark-theme'}`}>
                {/* <button className="btn" onClick={fullscreen} disabled={isProcessing} >
                    <span className="material-icons">fullscreen</span>
                    <span>Full Screen</span>
                </button>
                <label htmlFor="import-code" className="btn" disabled={isProcessing} >
                    <span className="material-icons">cloud_download</span>
                    <span>Import Code</span>
                </label>
                <input type="file" id="import-code" style={{display: "none"}} onChange={ImportCode} disabled={isProcessing}/>
                <button className="btn" onClick={exportCode} disabled={isProcessing} >
                    <span className="material-icons" >cloud_upload</span>
                    <span>Export Code</span>
                </button> */}
                <button className="Runbtn" onClick={RunCode} disabled={isProcessing} >
                    <span className="material-icons runArrow">play_arrow</span>
                    <span>{isProcessing ? "Running..." : "Run Code"}</span>
                </button>
            </div>
        </div>
    );
};
export default EditorContainer;