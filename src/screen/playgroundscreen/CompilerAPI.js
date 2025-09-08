import axios from "axios";

const API = axios.create({
  baseURL: "https://emkc.org/api/v2/piston",
});

const LANGUAGE_VERSIONS = {
    c: "10.2.0",
    python: "3.10.0",
    java: "15.0.2",
    javascript: "18.15.0",
};

export const executeCode = async (language, sourceCode, stdin) => {
  const response = await API.post("/execute", {
    language: language,
    version: LANGUAGE_VERSIONS[language],
    files: [
      {
        content: sourceCode,
      },
    ],
    stdin: stdin,
  });
  return response.data;
};