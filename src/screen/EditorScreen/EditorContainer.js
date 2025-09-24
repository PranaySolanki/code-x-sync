'use client';
import { useRef, useState, useEffect } from "react";
import "./EditorContainer.scss"
import Editor from "@monaco-editor/react";
import  executeCode  from "./CompilerAPI";
import { Tooltip } from "@mui/material";
import {  
   joinProject, 
    emitCursorMove, 
    listenForCodeUpdates, 
    listenForInitialCode,
    listenForCursorUpdates,
    emitCodeChange
 } from '@/screen/EditorScreen/socket.js';

const EditorContainer = ({ onCodeRun, input, theme, setTheme, fileName, onTitleChange,code_language,fileId }) => {

    const [code, setCode] = useState('');
    const [language, setLanguage] = useState(code_language);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleInput, setTitleInput] = useState(fileName);
    const [isProcessing, setIsProcessing] = useState(false);

    const [otherCursors, setOtherCursors] = useState({});
    const editorRef = useRef(null); // Ref for Monaco editor instance
    const disposables = useRef([]); // To clean up listeners
    const isUpdatingExternally = useRef(false);
    const codeRef = useRef();

 useEffect(() => {
    setTitleInput(fileName || "Untitled");
    setLanguage(code_language);
    }, [fileName], [code_language]);

    useEffect(() => {
        if(!fileId) return;
        // Join the Socket.io room for this specific file
        joinProject(fileId);
        console.log("Joined project room: ", fileId);

        // Listen for the initial code from the server
        listenForInitialCode((initialCode) => {
            setCode(initialCode);
            codeRef.current = initialCode;
        });

        // Listen for real-time code updates 
        listenForCodeUpdates((data) => {
            // Check if the update is from another user
            isUpdatingExternally.current = true;
            setCode(data.code);
            codeRef.current = data.code;

            // Use a short delay to prevent the local change from re-triggering a broadcast
            setTimeout(() => {
                isUpdatingExternally.current = false;
            }, 50);
        });

        const cursorListener = listenForCursorUpdates((data) => {
            setOtherCursors(prev => ({
                ...prev,
                [data.userId]: data.position
            }));
        });
    return () => {
            // cursorListener(); // Assuming your socket.js returns a cleanup function
            disposables.current.forEach(d => d.dispose());
        };
    }, [fileId]);
    
    useEffect(() => {
    if (!fileId) return;

    listenForCursorUpdates((data) => {
        console.log("Received cursor update from:", data.userId, "at:", data.position);
      setOtherCursors(prev => ({
        ...prev,
        [data.userId]: data.position
      }));
    });

    const cleanupCodeUpdates = listenForCodeUpdates((data) => {
            // ...
        });
        const cleanupCursorUpdates = listenForCursorUpdates((data) => {
            // ...
        });

        return () => {
            cleanupCodeUpdates();
            cleanupCursorUpdates();
        };
  }, [fileId]);

   const handleCursorMove = (e) => {
    // This event handler will get the cursor position
    const editor = editorRef.current;
    if (editor && fileId) {
      const position = editor.getPosition();
      emitCursorMove(fileId, position);
    }
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;

    // Emit cursor position whenever it changes
    const cursorDisposable = editor.onDidChangeCursorPosition((e) => {
        emitCursorMove(fileId, e.position);
    });
    
    disposables.current.push(cursorDisposable);
};

// Real time update code function
const onChangeCode = (newCode) => {
    // Update the local state
    setCode(newCode); 
    
    // Update the code ref for other functions (like RunCode)
    codeRef.current = newCode;
    
    // Check if the update is not from an external source
    if (!isUpdatingExternally.current && fileId) {
        // Emit the change to the server
        emitCodeChange(fileId, newCode);
    }
};


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
        //add onMouseMove={handleMouseMove}
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


                    <select onChange={onChangeLanguage} value={language} disabled={isProcessing} id="language-select" className="language-select">
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
                    onChange={(value, event) => {
                        onChangeCode(value);
                        handleCursorMove(event);
                    }}
                    value={code}
                    onMount={handleEditorMount}
                />
            </div>
            <div className={`editor-footer ${theme === 'vs-light' ? 'light-theme' : 'dark-theme'}`}>
                <button className="Runbtn" onClick={RunCode} disabled={isProcessing} >
                    <span className="material-icons runArrow">play_arrow</span>
                    <span>{isProcessing ? "Running..." : "Run Code"}</span>
                </button>
            </div>
        </div>
    );
};
export default EditorContainer;