import axios from "axios";

const API = axios.create({
  baseURL: "https://emkc.org/api/v2/piston",
});

const LANGUAGE_VERSIONS = {
  c: "*",
  python: "3",
  java: "*",
  // Use node version for JavaScript execution
  javascript: "*",
};

const executeCode = async (language, sourceCode, stdin) => {
  try {
    // Some runtimes expect specific language identifiers; keep 'javascript' but ensure version matches Node
    const payload = {
      language: language,
      version: LANGUAGE_VERSIONS[language],
      files: [{ content: sourceCode }],
      stdin: stdin,
    };

    const response = await API.post('/execute', payload);
    return response.data;
  } catch (err) {
    console.error('executeCode error', err?.response?.data || err.message || err);
    throw err;
  }
};
export default executeCode;