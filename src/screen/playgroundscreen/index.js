import "./index.scss"
import React, { useState } from 'react';
import { EditorContainer } from "./EditorContainer.js";
export const PlaygroundScreen = () => {

    const [output, setOutput] = useState('');
    const [input, setInput] = useState('');

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
            <div className="header">

                <img src="logo.png" className="logo" alt="logo"/>
                <span className="beside-logo"> CodeXsync</span>

            </div>

            <div className="content-container">

                <div className="editor-container">
                    <EditorContainer onCodeRun={setOutput} input={input}/>
                </div>
                <div className="input-output-container">
                    <div className="input-header">
                         <b>Input:</b>

                    </div>
                    <textarea value={input} onChange={(e) => setInput(e.target.value)}></textarea>
                </div>

                <div className="input-output-container">
                    <div className="output-header">
                        <div className="output-text">
                            <b>Output:</b></div>
                       <label htmlFor="output-file-export" className="icon-container" onClick={ExportOutput}>
                       <span className="material-symbols-outlined">ios_share</span>
                        <b>Export output</b>
                        </label>
                        <button style={{ display: 'none' }} id="output-file-export">
                            Export Output</button>
                    </div>
                    <textarea  
                        className={output.isError ? "error-text" : ""} 
                        value={output.text} 
                        readOnly>
                    </textarea>
                </div>
            </div>
        </div>
    );
};