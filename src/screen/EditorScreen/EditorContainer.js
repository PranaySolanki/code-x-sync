'use client';
import { useRef, useState, useEffect } from "react";
import "./EditorContainer.scss"
import Editor from "@monaco-editor/react";
import  executeCode  from "./CompilerAPI";
import { Tooltip } from "@mui/material";
import supabase from '@/helper/supabaseClient'; 

const EditorContainer = ({ onCodeRun, input, theme, setTheme, fileName, onTitleChange, code_language, isOwner,fileID }) => {

    const [code, setCode] = useState('');
    const [language, setLanguage] = useState(code_language);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleInput, setTitleInput] = useState(fileName);
    const [isProcessing, setIsProcessing] = useState(false);
    const [initialCodeLoaded, setInitialCodeLoaded] = useState('');

    const isUpdatingExternally = useRef(false);
    const channelRef = useRef(null); 
    const editorRef = useRef(null);

    const codeRef = useRef();

    const localClientIdRef = useRef('client-' + Math.random().toString(36).substring(2, 9));

    useEffect(() => {
        setTitleInput(fileName || "Untitled");
        setLanguage(code_language);
    }, [fileName], [code_language]);

    useEffect(() => {
        if (!fileID) return;
        // Define a unique channel name using the fileID (e.g., 'project:fileID')
        const channelName = `file_sync:${fileID}`;
        // Create the channel using Supabase client
        const channel = supabase.channel(channelName, {
            // You can leave the config object empty {} if you only want the broadcast extension.
            config: {
            }
        });
        channelRef.current = channel;
        channel.on(
            'broadcast',
            { event: 'code-change' },
            (payload) => {
                // Receive code change from another user
                isUpdatingExternally.current = true;
                const editor = editorRef.current;
                
                if (editor) {
                    // APPLY THE CHANGE DIRECTLY TO THE MODEL
                    editor.getModel().applyEdits(payload.payload.changes);
                    
                    // OPTIONAL: Update local state to ensure React is aware of the change
                    setCode(editor.getValue()); 
                }

                setTimeout(() => { isUpdatingExternally.current = false; }, 50);
                }
        );
        channel.on(
            'broadcast',
            { event: 'request-initial-code' },
            (payload) => {
                // A user has requested the current state.
                const currentCode = editorRef.current?.getValue() || codeRef.current;
                
                if (currentCode) {
                    // 💡 NEW STEP: Send the current code back to the entire channel
                    channel.send({
                        type: 'broadcast',
                        event: 'initial-code-response',
                        payload: { 
                            code: currentCode,
                            userId: localClientIdRef.current // Identify the sender
                         }
                    });
                }
            }
        )
         channel.on(
            'broadcast',
            { event: 'initial-code-response' },
            (payload) => {

                 if (payload.payload.senderId === localClientIdRef.current) {
            return; // EXIT: Do not process this message
        }
                
                const initialCode = payload.payload.code;
                
                // Only update if the current local code is empty (or the default initial load)
                if (editorRef.current && editorRef.current.getValue() === '') {
                    editorRef.current.setValue(initialCode);
                    setCode(initialCode);
                    codeRef.current = initialCode;
                }
            }
        );
        channel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                //  After subscribing, request the current state
                channel.send({
                    type: 'broadcast',
                    event: 'request-initial-code',
                    // Use the client's own random ID so the sender knows where to reply
                    payload: { userId: localClientIdRef.current } 
                });
            }
            
        });
        return () => {
            // Unsubscribe and remove the channel when leaving the editor
            if (channelRef.current) {
                channelRef.current.unsubscribe();
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [fileID]);

    const handleEditorChanges = (editor) => {
        editorRef.current = editor;

            // Use onDidChangeModelContent to get the list of changes (the "patches")
            editor.onDidChangeModelContent((event) => {
            // If the change came from an external source, do nothing and return.
            if (isUpdatingExternally.current) return;
            
            // This is a local change. Get the full code for consistency, 
            // but for a better system, you would send event.changes.
            const newCode = editor.getValue(); 
            codeRef.current = newCode;

            // Broadcast the change event object itself for other clients to apply
            if (channelRef.current) {
                channelRef.current.send({
                    type: 'broadcast',
                    event: 'code-change',
                    payload: { 
                        changes: event.changes, // Send the specific changes
                        code: newCode, // Send the full code as a fallback/check
                        userId: localClientIdRef.current // Identify the sender
                    }
                });
            }
            
            // Update local state AFTER broadcasting (or before, consistency depends on your choice)
            // NOTE: Setting state here is fine for simple display, but the editor already has the new value.
            setCode(newCode); 
        });
    // ... setup for cursor changes (onDidChangeCursorPosition) ...
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
                        <b className="title" onClick={() => isOwner && setIsEditingTitle(true)}>{fileName || "Untitled"}</b>
                    )}
                    {isOwner && (
                        <span className="material-icons" onClick={() => setIsEditingTitle(true)}>edit</span>
                    )}
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
                    onMount={handleEditorChanges}
                    value={code}
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