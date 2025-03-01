import { useState } from "react";
import { Box, Button, Textarea, Text, useToast } from "@chakra-ui/react";
import { executeCode } from "../api";
import * as Babel from "@babel/standalone"; // Import Babel for JSX transpilation

const Output = ({ editorRef, language }) => {
  const toast = useToast();
  const [output, setOutput] = useState([]);
  const [executionTime, setExecutionTime] = useState("Not Available");
  const [memoryUsed, setMemoryUsed] = useState("Not Available");
  const [userInput, setUserInput] = useState("");  
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [iframeSrc, setIframeSrc] = useState(""); // For iframe execution

  const runCode = async () => {
    let sourceCode = editorRef.current.getValue();
    if (!sourceCode) {
      toast({
        title: "Error",
        description: "No code to execute.",
        status: "error",
        duration: 5000,
      });
      return;
    }

    // ✅ If React/JSX, transpile and run inside an iframe
    if (language === "javascript" && sourceCode.includes("<")) {
      try {
        sourceCode = Babel.transform(sourceCode, { presets: ["react", "env"] }).code;

        const htmlTemplate = `
          <html>
            <head>
              <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
              <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            </head>
            <body>
              <div id="root"></div>
              <script>
                ${sourceCode}
                ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
              </script>
            </body>
          </html>
        `;

        setIframeSrc("data:text/html;charset=utf-8," + encodeURIComponent(htmlTemplate));
        return;
      } catch (error) {
        toast({
          title: "JSX Transpilation Error",
          description: error.message,
          status: "error",
          duration: 5000,
        });
        return;
      }
    }

    // ✅ If another language, run on Piston API
    try {
      setIsLoading(true);
      setIsError(false);

      const { output, stderr, time, memory } = await executeCode(language, sourceCode, userInput);

      let finalOutput = output ? output.split("\n") : ["No output produced"];
      let errorMessage = stderr ? stderr.split("\n") : null;

      if (errorMessage && errorMessage.length > 0 && errorMessage[0].trim() !== "") {
        setIsError(true);
        setOutput(errorMessage);
      } else {
        setOutput(finalOutput);
      }

      setExecutionTime(time);
      setMemoryUsed(memory);
    } catch (error) {
      console.log(error);
      setIsError(true);
      toast({
        title: "Execution failed.",
        description: error.message || "Unable to run code.",
        status: "error",
        duration: 6000,
      });
      setOutput(["Execution Error"]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box w="50%">
      <Text fontSize="lg" mb={2} color="purple.400">User Input:</Text>
      <Textarea 
        value={userInput} 
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Enter input for the program"
        mb={4}
      />
      <Button variant="outline" colorScheme="green" mb={4} isLoading={isLoading} onClick={runCode}>
        Run Code
      </Button>
      <Text fontSize="lg" mb={2} color="purple.400">Output:</Text>

      {/* ✅ If JavaScript (JSX), show iframe */}
      {language === "javascript" && iframeSrc ? (
        <iframe src={iframeSrc} title="output" width="100%" height="300px" style={{ border: "1px solid black" }} />
      ) : (
        <Box 
          p={2} 
          border="1px solid" 
          borderRadius={4} 
          borderColor={isError ? "red.500" : "#333"}  
          color={isError ? "red.400" : "inherit"}  
        >
          {output.length > 0 ? output.map((line, i) => <Text key={i}>{line}</Text>) : 'Click "Run Code" to see the output here'}
        </Box>
      )}

      <Text mt={4} color={executionTime === "Not Available" ? "white" : "yellow.400"}>Execution Time :   {executionTime}</Text>
      <Text color={memoryUsed === "Not Available" ? "white" : "yellow.400"}>Memory Used   :   {memoryUsed}</Text>
    </Box>
  );
};

export default Output;
