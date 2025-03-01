import axios from "axios";
import { LANGUAGE_VERSIONS } from "./constants";

const API = axios.create({
  baseURL: "https://emkc.org/api/v2/piston",
});

export const executeCode = async (language, sourceCode, userInput = "") => {
  try {
    const response = await API.post("/execute", {
      language: language,
      version: LANGUAGE_VERSIONS[language],
      files: [{ content: sourceCode }],
      stdin: userInput.trim(),  
    });

    const runData = response.data.run;

    return {
      run: response.data,
      output: runData?.stdout || "No output received",
      stderr: runData?.stderr || "",
      time: runData?.time !== undefined ? `${runData.time} sec` : "Not Available",
      memory: runData?.memory !== undefined ? `${runData.memory} KB` : "Not Available"
    };
  } catch (error) {
    console.error("API Execution Error:", error);
    return { run: null, output: "Execution failed.", stderr: error.message, time: "Not Available", memory: "Not Available" };
  }
};
