'use client';
// Import necessary React hooks
import { useRef, useState, useEffect } from "react";
// Import SCSS styles for this component
import "./EditorContainer.scss"
// Import the Monaco Editor component
import Editor from "@monaco-editor/react";
// Import the API function to execute code
import  executeCode  from "./CompilerAPI";
// Import Tooltip component from Material-UI for hover tips
import { Tooltip } from "@mui/material";
// Import the initialized Supabase client
import supabase from '@/helper/supabaseClient';

// Import the custom popup component for running code
import RunPopup from './RunPopup';


// Define the EditorContainer component and destructure its props
const EditorContainer = ({ onCodeRun, input, theme, setTheme, fileName, onTitleChange, code_language, isOwner, fileID, onCodeChange, code: initialCode }) => {

    // --- STATE VARIABLES ---
    const FileID = fileID;
    // State for the code currently in the editor
    const [code, setCode] = useState('');
    // State for the selected programming language (e.g., 'c', 'java')
    const [language, setLanguage] = useState(code_language);
    // State to toggle the file name input field
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    // State to hold the temporary value of the file name while editing
    const [titleInput, setTitleInput] = useState(fileName);
    // State to show a loading/processing state (e.g., when running code)
    const [isProcessing, setIsProcessing] = useState(false);
    // State to track if the current code is saved to the database (true = "Saved", false = "Save Code")
    const [isSaved, setIsSaved] = useState(true);

    // --- REFS ---
    // Refs are used to hold values that persist across renders without causing a re-render

    // Ref to flag when an editor change is coming from an external source (Supabase)
    // This prevents an infinite loop of broadcasting changes
    const isUpdatingExternally = useRef(false);
    // Ref to hold the Supabase channel instance
    const channelRef = useRef(null);
    // Ref to hold the Monaco editor instance itself (for methods like .getValue(), .setValue())
    const editorRef = useRef(null);
    // Ref to hold the *latest* version of the code, accessible from any function
    const codeRef = useRef();
    // Ref to create a unique ID for this specific client instance
    const localClientIdRef = useRef('client-' + Math.random().toString(36).substring(2, 9));
    // State to control the visibility of the "Run Code" confirmation popup
    const [showRunPopup, setShowRunPopup] = useState(false);
    // State to store a snapshot of the code when the "Run" button is clicked
    const [popupCode, setPopupCode] = useState("");
    // State to store the list of all users currently online in this file's channel
    const [onlineUsers, setOnlineUsers] = useState({});
    // State to store the profile information of the *current* user (this browser)
    const [currentUser, setCurrentUser] = useState(null);

    const [liveUserCount , setliveUserCount] = useState(null);


    // --- FUNCTIONS ---

    /**
     * Handles manually saving the code to the Supabase database.
     * This is triggered by clicking the "Save Code" button.
     */
    const manualSave = async (codeContent) => {
        if (!fileID || !codeContent) return; // Do nothing if there's no file ID or content
        
        try {
            // Update the 'File-Table' in Supabase where file_id matches
            const { error } = await supabase
                .from('File-Table')
                .update({ 
                    content: codeContent, // Set the new code content
                    updated_at: new Date().toISOString() // Update the timestamp
                })
                .eq('file_id', fileID); // Match the specific file
            
            if (error) {
                // Handle save error
                console.error('Save error:', error);
                alert('Failed to save code. Please try again.');
            } else {
                // --- Save was successful ---
                
                // Set saved state to true (shows "Saved" button)
                // Use a small delay to prevent rapid state toggling
                setTimeout(() => {
                    setIsSaved(true);
                }, 100);
                
                // Broadcast the 'saved' status to all other users on the channel
                if (channelRef.current) {
                    channelRef.current.send({
                        type: 'broadcast',
                        event: 'status-saved', // Custom event name for "saved"
                        payload: {
                            userId: localClientIdRef.current,
                            timestamp: new Date().toISOString()
                        }
                    });
                }
                
                // Show a temporary "Code saved successfully!" message on screen
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
                // Remove the message after 3 seconds
                setTimeout(() => {
                    document.body.removeChild(successMessage);
                }, 3000);
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save code. Please try again.');
        }
    };

    // --- USE-EFFECT HOOKS ---

    // Effect to sync state when props change (fileName or code_language)
    useEffect(() => {
        setTitleInput(fileName || "Untitled");
        setLanguage(code_language);
    }, [fileName, code_language]);

    // Effect that runs only once on component mount
    useEffect(() => {
        // Set the initial state of the button to "Saved"
        setIsSaved(true);
    }, []); // Empty dependency array ensures this runs only once

    // Effect to fetch the current user's data (for presence)
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                // 1. Get the authenticated user from Supabase Auth
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                
                if (authError || !user) {
                    console.error('Error getting current user:', authError);
                    return;
                }

                // 2. Fetch the user's profile data (like name and avatar) from 'User-Table'
                const { data: profileData, error: profileError } = await supabase
                    .from('User-Table')
                    .select('user_name, avatar_url')
                    .eq('user_id', user.id)
                    .single();

                if (profileError) {
                    // If profile fetch fails, use fallback data from auth metadata
                    console.error('Error fetching user profile:', profileError);
                    setCurrentUser({
                        id: user.id,
                        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
                        avatar_url: user.user_metadata?.avatar_url || null
                    });
                } else {
                    // If profile fetch succeeds, set the user data
                    setCurrentUser({
                        id: user.id,
                        full_name: profileData.user_name || user.user_metadata?.full_name || user.email,
                        avatar_url: profileData.avatar_url || null
                    });
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchCurrentUser();
    }, []); // Runs once on mount

    // Effect to load the initial code from the prop
   

    // --- MAIN REAL-TIME EFFECT (Supabase Channel) ---
    // This is the core of the collaboration features
    useEffect(() => {
        if (!fileID) return; // Don't run if there's no fileID

        // 1. Create a unique channel name for this file
        const channelName = `file_sync:${fileID}`;
        const channel = supabase.channel(channelName);
        channelRef.current = channel; // Store the channel in a ref

        // 2. Set up event listeners for the channel

        // --- Code Syncing Listeners ---

        // Listen for 'code-change' events broadcast by *other* users
        channel.on(
            'broadcast',
            { event: 'code-change' },
            (payload) => {
                // Set the external update flag to true to prevent re-broadcasting
                isUpdatingExternally.current = true;
                const editor = editorRef.current;
                if (editor) {
                    // Apply the *exact* changes (edits) from the other user
                    editor.getModel().applyEdits(payload.payload.changes,[]);
                    
                    // Update the local state and ref with the new code
                   
                    setIsSaved(false);
                }
                // Unset the flag
                isUpdatingExternally.current = false;
            }
        );
        
        // Listen for 'status-dirty' events (when another user starts typing)
        channel.on(
            'broadcast',
            { event: 'status-dirty' },
            (payload) => {
                // Set the save button to "Save Code"
                setIsSaved(false);
            }
        );
        
        // Listen for 'status-saved' events (when another user clicks "Save Code")
        channel.on(
            'broadcast',
            { event: 'status-saved' },
            (payload) => {
                // Set the save button back to "Saved"
                setIsSaved(true);
            }
        );

        // --- New User Syncing Logic ---
        // (To get the code when first joining)

        // Listen for 'request-initial-code' (from a new user)
        channel.on(
            'broadcast',
            { event: 'request-initial-code' },
            (payload) => {
                // Someone new joined and is asking for the current code
                // Get the current code from the editor
                const currentCode = editorRef.current?.getValue() || codeRef.current;
                if (currentCode) {
                    // Send the current code back to *everyone* on the channel
                    // NOTE: use 'senderId' so receivers can correctly ignore responses they sent themselves
                    channel.send({
                        type: 'broadcast',
                        event: 'initial-code-response',
                        payload: {
                            code: currentCode,
                            senderId: localClientIdRef.current
                        }
                    });
                }
            }
        )
        
        // Listen for 'initial-code-response' (from an existing user)
         channel.on(
            'broadcast',
            { event: 'initial-code-response' },
            (payload) => {
                // Ignore this message if we were the one who sent it
                if (payload?.payload?.senderId === localClientIdRef.current) {
                    return;
                }

                const respondedCode = payload?.payload?.code;
                // Only set the code if our editor is currently empty to avoid stomping a live editor
                if (respondedCode && editorRef.current && editorRef.current.getValue && editorRef.current.getValue() === ''  ) {
                    isUpdatingExternally.current = true;
                    editorRef.current.setValue(respondedCode);
                    setCode(respondedCode);
                    codeRef.current = respondedCode;
                    isUpdatingExternally.current = false;
                }
            }
        );
        
        // --- New User Syncing Logic (respond to requests) ---

        // --- Presence (Online Users) Listeners ---

        // 'sync' fires *once* when YOU join, giving the full list of users
        channel.on('presence', { event: 'sync' }, async () => {
            const state = channel.presenceState(); // Get the complete list
             const users = {};
             // Format the list into a simple object
             Object.keys(state).forEach((key) => {
                 if (state[key][0]) {
                     users[key] = state[key][0];
                 }
             });
             setOnlineUsers(users); // Set the state

            // Decide whether to load the DB-provided initialCode:
            // - If there is only one user in the room (yourself), load the initialCode prop.
            // - If there are more users, skip loading the DB initial and let live broadcasts provide the code.
            const usersCount = Object.keys(users).length;
            setliveUserCount(usersCount);
            console.log('Presence sync user count:', usersCount);
            if (usersCount <= 0) {
                // if (initialCode !== undefined && initialCode !== null) {
                isUpdatingExternally.current = true;
                 const { data, error } = await supabase
                .from('File-Table')
                .select('content, file_name, extension')
                .eq('file_id', FileID)
                .single();
            
            if (data) {
                setCode(data.content);
                codeRef.current = data.content;
            }
            else if (error) {
                console.log('Error loading file content:', error);
            }
                    isUpdatingExternally.current = false;
                    // }
                }
         });
 
         // 'join' fires when a NEW user joins the channel
         channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
             setOnlineUsers((prev) => {
                 const updated = { ...prev };
                 newPresences.forEach((presence) => {
                     updated[key] = presence; // Add the new user to the list
                 });
                 return updated;
             });
         });
 
         // 'leave' fires when a user leaves the channel
         channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
             setOnlineUsers((prev) => {
                 const updated = { ...prev };
                 leftPresences.forEach((presence) => {
                     delete updated[key]; // Remove the user from the list
                 });
                 return updated;
             });
         });

        // 3. Subscribe to the channel to start listening
        channel.subscribe((status) => {
             if (status === 'SUBSCRIBED') {
                 // Now that we are subscribed, ask existing users for the current code state
                 channel.send({
                     type: 'broadcast',
                     event: 'request-initial-code',
                     payload: { userId: localClientIdRef.current }
                 });
                // If we already have currentUser, try to track presence now
                if (currentUser) {
                    channel.track({
                        user_id: currentUser.id,
                        name: currentUser.full_name,
                        avatar_url: currentUser.avatar_url
                    }).then(() => {
                        // console.log('Tracked presence on subscribe for', currentUser.full_name);
                    }).catch(err => {
                        console.error('Error tracking presence on subscribe:', err);
                    });
                } else {
                    // console.log('currentUser not ready at SUBSCRIBED. Will track when currentUser is set.');
                }
             }
         });

        // 4. Cleanup function (runs when component unmounts or fileID changes)
        return () => {
            if (channelRef.current && currentUser) {
                try {
                    channelRef.current.untrack(); // Stop tracking presence
                } catch (error) {
                    console.error('Error untracking presence:', error);
                }
            }
            if (channelRef.current) {
                channelRef.current.unsubscribe(); // Unsubscribe from the channel
                supabase.removeChannel(channelRef.current); // Remove the channel instance
                channelRef.current = null;
            }
        };
    }, [fileID]); // Re-run this entire effect if the fileID changes

    // Effect to "track" the user's presence (announce they are online)
    // This runs *after* the user's data is fetched and the channel is ready
    useEffect(() => {
        const trackPresence = async () => {
            if (!currentUser) {
                return;
            }
            if (!channelRef.current) {
                return;
            }

            // Wait for the channel to become joined / subscribed (retry a few times)
            let tries = 0;
            const maxTries = 6;
            while (tries < maxTries) {
                const state = channelRef.current.state || channelRef.current.status || null;
                // console.log(`trackPresence: attempt ${tries + 1}, channel state:`, state);
                if (state === 'joined' || state === 'SUBSCRIBED' || state === 'subscribed') break;
                // small delay before next check
                // eslint-disable-next-line no-await-in-loop
                await new Promise((res) => setTimeout(res, 500));
                tries += 1;
            }

            try {
                await channelRef.current.track({
                    user_id: currentUser.id,
                    name: currentUser.full_name,
                    avatar_url: currentUser.avatar_url
                });
                // console.log('Presence tracked for user:', currentUser.full_name);
            } catch (error) {
                console.error('Error tracking presence after retries:', error);
            }
        };

        trackPresence();
    }, [currentUser]); // Run this whenever the currentUser state is set


    //  useEffect(() => {
    //     if (initialCode !== undefined && initialCode !== null) {
    //         setCode(initialCode); // Set the editor's visual state
    //         codeRef.current = initialCode; // Set the ref for non-React functions
    //     }
    // }, [initialCode]);

    /**
     * Monaco Editor's onMount handler.
     * This sets up the change listener for local edits.
     */
    const handleEditorChanges = (editor) => {
        editorRef.current = editor; // Store the editor instance

        // Listen for any content changes (typing, pasting, deleting)
        editor.onDidChangeModelContent((event) => {
            // If the change came from Supabase, IGNORE IT.
            if (isUpdatingExternally.current) return;
            
            // --- This is a LOCAL change (the user typed) ---
            const newCode = editor.getValue(); 
            codeRef.current = newCode; // Update the ref

            // 1. Set local save state to "Save Code"
            setIsSaved(false);

            // 2. Broadcast the *code changes* to other users
            if (channelRef.current) {
                channelRef.current.send({
                    type: 'broadcast',
                    event: 'code-change',
                    payload: { 
                        changes: event.changes, // Send the *specific* edits
                        code: newCode, // Send the full code as a fallback
                        userId: localClientIdRef.current
                    }
                });
                
                // 3. Broadcast the *dirty status* to other users
                channelRef.current.send({
                    type: 'broadcast',
                    event: 'status-dirty',
                    payload: {
                        userId: localClientIdRef.current,
                        timestamp: new Date().toISOString()
                    }
                });
            }
        });
    };

    // --- UTILITY FUNCTIONS ---

    // Map language names to file extensions for downloading
    const fileExtensionMapping = {
        c: 'c',
        java: 'java',
        python:'py',
        javascript: 'js'
    }

    // Function to download the current code as a file
    const exportCode = () => {
        const codeValue = codeRef.current?.trim();
        if(!codeValue){
            alert("Please type some code in the editor before exporting.")
        }
        else{
            // Create a temporary file in memory (a "blob")
            const codeBlob  = new Blob([codeValue], {type:"text/plain"});
            // Create a temporary downloadable URL for the blob
            const downloadURL = URL.createObjectURL(codeBlob);
            // Create a hidden link element
            const link = document.createElement("a");
            link.href = downloadURL;
            link.download = `${fileName}.${fileExtensionMapping[language]}` // Set the file name
            link.click(); // Programmatically click the link to trigger download
        }
    }

    // Function to handle uploading a code file from the user's computer
    const ImportCode = (event) => {
        const file = event.target.files[0];
        if (file) {
            const fileReader = new FileReader();
            fileReader.readAsText(file) // Read the file as text
            fileReader.onload = function(value){
                const importedCode = value.target.result;
                // Update all code states
                setCode(importedCode); 
                codeRef.current = importedCode; 
                 if (editorRef.current) {
                     editorRef.current.setValue(importedCode); // Set the Monaco editor value
                 }
            }
        }
    }

    // Function to handle changing the programming language
    const onChangeLanguage = async (event) => {
        const newLanguage = event.target.value;
        setLanguage(newLanguage); // Update local state
        
        // If this is a saved file, update the language in the database
        if (fileID) {
            try {
                // (Error handling and database update logic...)
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError || !user) { /* ... error handling ... */ return; }

                const { data: fileData, error: readError } = await supabase
                    .from('File-Table')
                    .select('file_id')
                    .eq('file_id', fileID)
                    .single();

                if (readError) { /* ... error handling ... */ return; }

                const { data, error } = await supabase
                    .from('File-Table')
                    .update({ 
                        extension: newLanguage, // Update the 'extension' column
                        updated_at: new Date().toISOString()
                    })
                    .eq('file_id', fileID);
                
                if (error) {
                    console.error('Database error updating language:', error);
                    alert(`Failed to update language: ${error.message || 'Unknown error'}`);
                } else {
                    // (Show success message logic...)
                }
            } catch (error) {
                console.error('Unexpected error updating language:', error);
                alert(`Unexpected error: ${error.message || 'Please try again.'}`);
            }
        }
    }

    // Function to toggle the editor theme
    const onChangeTheme = () => {
        setTheme(theme === 'vs-light' ? 'vs-dark' : 'vs-light');
    }

    // Placeholder for fullscreen functionality
    const fullscreen = () => {
       // Functionality to be implemented
    }

    // --- CODE EXECUTION FUNCTIONS ---

    /**
     * This function is called *after* the user confirms in the popup.
     * It sends the code to the execution API.
     */
    const handlePopupRun = async (codeToRun) => {
        setShowRunPopup(false); // Close the popup

        const sourceCode = (codeToRun || codeRef.current);
        if (!sourceCode) {
            onCodeRun({ text: "", isError: false }); // Send empty output
            alert("Please write some code to run!");
            return;
        }

        setIsProcessing(true); // Show loading state
        onCodeRun({ text: "Processing Please Wait!...", isError: false }); // Show "Processing" in output
        try {
            // Call the external API to run the code
            const { run: result } = await executeCode(language, sourceCode, input);

            // Check if the result has a standard error (stderr)
            if (result?.stderr) {
                onCodeRun({ text: result.stderr, isError: true }); // Show error in output
            } else {
                onCodeRun({ text: result?.stdout || "", isError: false }); // Show success output
            }
        } catch (error) {
            console.error(error);
            onCodeRun({ text: "Failed to connect to the API or an error occurred.", isError: true });
        } finally {
            setIsProcessing(false); // Stop loading state
        }
    };

    /**
     * This function is called when the "Run Code" button is *first* clicked.
     * It just opens the confirmation popup.
     */
    const handleRunClick = () => {
        // Take a snapshot of the current code
        const currentValue = editorRef.current ? editorRef.current.getValue() : codeRef.current;
        setPopupCode(currentValue || ""); // Store it in state
        setShowRunPopup(true); // Show the popup
    };

 
    // --- JSX (COMPONENT RENDER) ---
    
    return(
        <div className="root-editor-container" >
            {/* --- HEADER --- */}
            <div className={`editor-header ${theme === 'vs-light' ? 'light-theme' : 'dark-theme'}`}>
                {/* Header Left: Title and Save Button */}
                <div className="editor-left-container">
                    <a href="/dashboard">
                        <Tooltip title="Back to Dashboard" placement="bottom" arrow enterDelay={100} leaveDelay={0}>
                            <span className="material-symbols-outlined back-to-dashboard">arrow_back</span>
                        </Tooltip>
                    </a>

                    {/* Conditional rendering for file title: Show input or text */}
                    {isEditingTitle ? (
                        <input
                            type="text"
                            value={titleInput}
                            onChange={(e) => setTitleInput(e.target.value)}
                            onBlur={() => { // When focus is lost
                                onTitleChange(titleInput); // Call parent prop to save title
                                setIsEditingTitle(false);
                            }}
                            onKeyDown={(e) => { // Handle Enter/Escape keys
                                if (e.key === 'Enter') {
                                    onTitleChange(titleInput);
                                    setIsEditingTitle(false);
                                } else if (e.key === 'Escape') {
                                    setTitleInput(fileName || "Untitled"); // Revert changes
                                    setIsEditingTitle(false);
                                }
                            }}
                            className="title-input"
                            autoFocus
                        />
                    ) : (
                        // Show the file name as text
                        <b className="title" onClick={() => isOwner && setIsEditingTitle(true)}>{fileName || "Untitled"}</b>
                    )}
                    {/* Show edit icon only for the file owner */}
                    {isOwner && (
                        <span className="material-icons" onClick={() => setIsEditingTitle(true)}>edit</span>
                    )}
                    
                    {/* Dynamic save button: changes class based on 'isSaved' state */}
                    <button 
                        className={`saveBtn ${isSaved ? 'saved' : 'unsaved'}`} 
                        disabled={isProcessing} 
                        onClick={() => {
                            manualSave(codeRef.current); // Save the code from the ref
                        }}
                    >
                        {isSaved ? 'Saved' : 'Save Code'}
                    </button>
                </div>

                {/* Header Right: Avatars and Action Buttons */}
                <div className="editor-right-container">
                    
                     <div className="online-users-container">
                         {/* Loop over the 'onlineUsers' state object */}
                         {Object.values(onlineUsers).map((userPresence) => {
                            // userPresence can be an array, get the first element
                            const userData = Array.isArray(userPresence) ? userPresence[0] : userPresence;
                            if (!userData) return null; // Skip if user data is invalid

                            // Check if a valid avatar_url exists
                            const hasAvatar = userData.avatar_url && userData.avatar_url.trim() !== '';
                            
                            // Calculate the user's initial (e.g., "John Doe" -> "J")
                            let initial = '';
                            if (userData.name && userData.name.trim() !== '') {
                                initial = userData.name.charAt(0).toUpperCase();
                            }

                            // Wrap in a Tooltip to show the user's full name on hover
                            return (
                                <Tooltip 
                                    key={userData.user_id} 
                                    title={userData.name || 'User'} 
                                    placement="bottom" 
                                    arrow 
                                    enterDelay={100} 
                                    leaveDelay={0}
                                >
                                    {/* --- Conditional Rendering Logic --- */}
                                    {hasAvatar ? (
                                        // 1. If avatar URL exists, render the image
                                        <img 
                                            src={userData.avatar_url}
                                            alt={userData.name || 'User'}
                                            className="online-user-avatar" // Uses SCSS for size, border
                                            onError={(e) => {
                                                // Fallback if the image link is broken
                                                e.target.onerror = null;
                                                e.target.src = '/logo.png'; // Use a default logo
                                            }}
                                        />
                                    ) : (
                                        // 2. If no avatar, render a <div> with the initial
                                        <div
                                            className="online-user-avatar" // Use same class for size/border
                                            style={{ // Add inline styles for the circle and text
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: '#6B7280', // Gray background
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '0.875rem',
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            {initial}
                                        </div>
                                    )}
                                </Tooltip>
                            );
                        })}
                    </div>
                    {/* --- END AVATAR LIST --- */}


                    {/* Action Buttons (Fullscreen, Upload, Download) */}
                    <Tooltip title="Full Screen" placement="bottom" arrow enterDelay={100} leaveDelay={0}>
                        <button className="btn" onClick={fullscreen} disabled={isProcessing} >
                            <span className="material-symbols-outlined">fullscreen</span>
                        </button>
                    </Tooltip>
                    <Tooltip title="Upload Code" placement="bottom" arrow enterDelay={100} leaveDelay={0}>
                        {/* Use a label to style a button that triggers a hidden file input */}
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

                    {/* Language Selector */}
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

                    {/* Theme Toggle Button */}
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

            {/* --- EDITOR BODY --- */}
            <div className="editor-body">
                {/* The Monaco Editor Component */}
                <Editor
                    width={"100%"}
                    height={"100%"}
                    language={language}
                    theme={theme}
                    options={{ // Set various editor options
                        wordWrap: "on",
                        fontSize: 17,
                        cursorSmoothCaretAnimation: "on",
                        cursorBlinking: "expand",
                        minimap:{ enabled: false },
                        overviewRulerLables: false,
                        glyphMargin: false,
                        hideCursorInOverviewRuler: true,
                        scrollBeyondLastLine: false,
                        readOnly: isProcessing // Make editor read-only while code is running
                    }}
                    onMount={handleEditorChanges} // Setup listeners when editor is ready
                    onChange={(value) => {
                        // This onChange only updates the ref,
                        // the broadcast logic is in 'handleEditorChanges'
                        if (!isUpdatingExternally.current) {
                            codeRef.current = value;
                            if (onCodeChange) {
                                onCodeChange(value);
                            }
                        }
                    }}
                    value={code} // The 'code' state controls the editor's content
                />
            
            {/* Show the RunPopup if 'showRunPopup' is true */}
            {showRunPopup && (
                <RunPopup
                    code={popupCode}
                    language={language}
                    onClose={() => setShowRunPopup(false)}
                    onRun={handlePopupRun}
                />
            )}

            </div>

            {/* --- FOOTER --- */}
            <div className={`editor-footer ${theme === 'vs-light' ? 'light-theme' : 'dark-theme'}`}>
                {/* The main "Run Code" button */}
                <button  className="Runbtn" onClick={handleRunClick} disabled={isProcessing} >
                    <span className="material-icons runArrow">play_arrow</span>
                    <span>{isProcessing ? "Running..." : "Run Code"}</span>
                </button>
            </div>
        </div>
    );
};
export default EditorContainer;