'use client';
import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import './EditorContainer.scss';

const RunPopup = ({ code = '', onClose, onRun, language = 'javascript',theme }) => {
  const codetheme = theme;
  const [localCode, setLocalCode] = useState(code);
  const editorRef = useRef(null);

  useEffect(() => {
    setLocalCode(code);
  }, [code]);

  const handleMount = (editor) => {
    editorRef.current = editor;
  };

  const handleRunClick = () => {
    const value = editorRef.current ? editorRef.current.getValue() : localCode;
    onRun(value);
  };

  return (
    <div className="run-popup-overlay">
      <div className="run-popup" style={{ background: theme === 'vs-dark' ? 'var(--popup-bg-dark, #1e1e1e)' : 'var(--popup-bg, #fff)' }}>
        <div className="run-popup-header">
          <h3>Run Preview</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="run-popup-editor">
          <Editor
            height="300px"
            language={language}
            theme={theme}
            defaultValue={code}
            onMount={handleMount}
            onChange={(value) => setLocalCode(value)}
            options={{ minimap: { enabled: false }, fontSize: 14 }}
          />
        </div>
        <div className="run-popup-actions">
          <button className="btn cancel" onClick={onClose}>Cancel</button>
          <button className="btn run" onClick={handleRunClick}>Run Code</button>
        </div>
      </div>
    </div>
  );
};

export default RunPopup;
