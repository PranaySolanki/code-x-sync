'use client';
import "@/screen/playgroundscreen/index.scss"
import React, { useState } from 'react';
import  EditorContainer  from "@/screen/playgroundscreen/EditorContainer.js";
import Image from 'next/image';
const PlaygroundScreen = () => {

    const [output, setOutput] = useState('');
    const [input, setInput] = useState('');
    const [theme, setTheme] = useState("vs-light");

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
                <span className="beside-logo"> CodeXSync</span>

            </div>

            <div className={`content-container ${theme === 'vs-light' ? 'light-theme' : 'dark-theme'}`}>

                <div className="editor-container">
                    <EditorContainer theme={theme} setTheme={setTheme} onCodeRun={setOutput} input={input}/>
                </div>
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
                        {/* <button style={{ display: 'none' }} id="output-file-export">
                            Export Output</button> */}
                    </div>
                    <textarea  
                        className={output.isError ? "error-text" : "output-textarea"} 
                        value={output.text} 
                        readOnly>
                    </textarea>
                </div>
                
            </div>
        </div>
    );
};
export default PlaygroundScreen;