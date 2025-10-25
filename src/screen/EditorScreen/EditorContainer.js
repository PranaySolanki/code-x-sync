'use client';
import { useRef, useState, useEffect } from "react";
import "./EditorContainer.scss"
import Editor from "@monaco-editor/react";
import  executeCode  from "./CompilerAPI";
import { Tooltip } from "@mui/material";
import supabase from '@/helper/supabaseClient';

const EditorContainer = ({ onCodeRun, input, theme, setTheme, fileName, onTitleChange, code_language, isOwner, fileID, onCodeChange, code: initialCode }) => { // Added code prop

    const [code, setCode] = useState('');
    const [language, setLanguage] = useState(code_language);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleInput, setTitleInput] = useState(fileName);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSaved, setIsSaved] = useState(true);

    const isUpdatingExternally = useRef(false);
    const channelRef = useRef(null);
    const editorRef = useRef(null);

    const codeRef = useRef();

    const localClientIdRef = useRef('client-' + Math.random().toString(36).substring(2, 9));

    // Manual save function
    const manualSave = async (codeContent) => {
        if (!fileID || !codeContent) return;
        
        try {
            const { error } = await supabase
                .from('File-Table')
                .update({ 
                    content: codeContent,
                    updated_at: new Date().toISOString()
                })
                .eq('file_id', fileID);
            
            if (error) {
                console.error('Save error:', error);
                alert('Failed to save code. Please try again.');
            } else {
                console.log('Code saved successfully');
                // Add a small delay to prevent immediate re-triggering
                setTimeout(() => {
                    setIsSaved(true);
                }, 100);
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.textContent = 'Code saved successfully!';
                successMessage.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #4CAF50;
                    color: white;
                    padding: 10px 15px;
                    border-radius: 4px;
                    z-index: 1000;
                    font-size: 14px;
                `;
                document.body.appendChild(successMessage);
                setTimeout(() => {
                    document.body.removeChild(successMessage);
                }, 3000);
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save code. Please try again.');
        }
    };

    useEffect(() => {
        setTitleInput(fileName || "Untitled");
        setLanguage(code_language);
    }, [fileName, code_language]); // Added code_language dependency

    // Set initial saved state when component first mounts
    useEffect(() => {
        setIsSaved(true);
    }, []); // Empty dependency array - only run once on mount

    // Load initial code when component mounts or when initialCode changes
    useEffect(() => {
        if (initialCode !== undefined && initialCode !== null) {
            setCode(initialCode);
            codeRef.current = initialCode;
            // Don't set isSaved to true here as this might be a real-time update
        }
    }, [initialCode]);

    // Load file content directly if fileID is provided and no initial code
    useEffect(() => {
        const loadFileContent = async () => {
            if (fileID && (!initialCode || initialCode === '')) {
                try {
                    console.log('Loading file content for fileID:', fileID);
                    const { data, error } = await supabase
                        .from('File-Table')
                        .select('content')
                        .eq('file_id', fileID)
                        .single();
                    
                    if (error) {
                        console.error('Error loading file content:', error);
                    } else if (data && data.content) {
                        console.log('Loaded file content:', data.content);
                        setCode(data.content);
                        codeRef.current = data.content;
                        setIsSaved(true); // Mark as saved when loading from database
                    }
                } catch (error) {
                    console.error('Error loading file content:', error);
                }
            }
        };

        loadFileContent();
    }, [fileID, initialCode]);
    useEffect(() => {
        if (!fileID) return;
        // Define a unique channel name using the fileID (e.g., 'project:fileID')
        const channelName = `file_sync:${fileID}`;
        // Create the channel using Supabase client
        const channel = supabase.channel(channelName);
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
                    editor.getModel().applyEdits(payload.payload.changes,[]);
                    }

                isUpdatingExternally.current = false;
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
                    isUpdatingExternally.current = true;
                    editorRef.current.setValue(initialCode);
                    setCode(initialCode);
                    codeRef.current = initialCode;
                    isUpdatingExternally.current = false;
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
        });
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

            link.download = `${fileName}.${fileExtensionMapping[language]}`
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
                setCode(importedCode); // Update visual editor state
                codeRef.current = importedCode; // Update ref used for saving
                 if (editorRef.current) {
                    editorRef.current.setValue(importedCode); // Also update Monaco instance directly
                 }
            }

        }
        else{
            alert("Please choose program file")
        }
    }

    const onChangeLanguage = async (event) => {
        const newLanguage = event.target.value;
        setLanguage(newLanguage);
        
        // Update the language in the database if this is an existing file
        if (fileID) {
            try {
                // First check if user is authenticated
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                
                if (authError || !user) {
                    console.error('Authentication error:', authError);
                    alert('Please log in again to update the language.');
                    return;
                }

                // First, let's check if we can read the file to verify permissions
                const { data: fileData, error: readError } = await supabase
                    .from('File-Table')
                    .select('file_id, file_name, extension')
                    .eq('file_id', fileID)
                    .single();

                if (readError) {
                    console.error('Error reading file:', readError);
                    alert(`Cannot access file: ${readError.message}`);
                    return;
                }

                console.log('File data found:', fileData);

                const { data, error } = await supabase
                    .from('File-Table')
                    .update({ 
                        extension: newLanguage,
                        updated_at: new Date().toISOString()
                    })
                    .eq('file_id', fileID);
                
                if (error) {
                    console.error('Database error updating language:', error);
                    console.error('Error details:', {
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: error.code
                    });
                    alert(`Failed to update language: ${error.message || 'Unknown error'}`);
                } else {
                    console.log('Language updated successfully to:', newLanguage);
                    console.log('Updated data:', data);
                    // Show a brief success message
                    const successMessage = document.createElement('div');
                    successMessage.textContent = `Language updated to ${newLanguage.toUpperCase()}`;
                    successMessage.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: #4CAF50;
                        color: white;
                        padding: 10px 15px;
                        border-radius: 4px;
                        z-index: 1000;
                        font-size: 14px;
                    `;
                    document.body.appendChild(successMessage);
                    setTimeout(() => {
                        document.body.removeChild(successMessage);
                    }, 3000);
                }
            } catch (error) {
                console.error('Unexpected error updating language:', error);
                alert(`Unexpected error: ${error.message || 'Please try again.'}`);
            }
        }
    }

    const onChangeTheme = () => {
        setTheme(theme === 'vs-light' ? 'vs-dark' : 'vs-light');
    }


    const fullscreen = () => {
       // Functionality to be implemented
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
                    
                    {/* Dynamic save button */}
                    <button 
                        className={`saveBtn ${isSaved ? 'saved' : 'unsaved'}`} 
                        disabled={isProcessing} 
                        onClick={() => {
                            manualSave(codeRef.current);
                        }}
                    >
                        {isSaved ? 'Saved' : 'Save Code'}
                    </button>
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


                    <select 
                        onChange={onChangeLanguage} 
                        value={language} 
                        id="s" 
                        disabled={isProcessing}
                        title="Select programming language"
                    >
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
                        wordWrap: "on",
                        fontSize: 17,
                        cursorSmoothCaretAnimation: "on",
                        cursorBlinking: "expand",
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
                    onChange={(value) => {
                        if (!isUpdatingExternally.current) {
                            setIsSaved(false);
                            codeRef.current = value;
                            if (onCodeChange) {
                                onCodeChange(value);
                            }
                        }
                    }}
                    value={code} // Keep this to set initial value and reflect external changes
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