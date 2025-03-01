import { useRef, useState, useEffect } from "react";
import { Box, HStack, Button, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, useDisclosure } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "../constants";
import Output from "./Output";
import axios from "axios";
import * as monaco from "monaco-editor";
import * as Babel from "@babel/standalone";

const registerLSP = () => {
  monaco.languages.register({ id: "javascript" });
  monaco.languages.register({ id: "typescript" });

  monaco.languages.onLanguage("javascript", () => {
    monaco.languages.setLanguageConfiguration("javascript", {
      autoClosingPairs: [{ open: "(", close: ")" }],
    });

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSyntaxValidation: false,
      noSemanticValidation: false,
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
    });
  });
};

const CodeEditor = () => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState("javascript");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    registerLSP();
  }, []);

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (language) => {
    setLanguage(language);
    setValue(CODE_SNIPPETS[language]);
  };

  const fetchAISuggestions = async () => {
    const code = editorRef.current.getValue();
    if (!code) return;

    try {
      console.log("🔹 Sending request to Hugging Face API...");
      const response = await axios.post(
        "https://api-inference.huggingface.co/models/bigcode/starcoder",
        {
          inputs: `### Code Analysis:\n${code}\n### Suggestions:`,
        },
        {
          headers: {
            "Authorization": `Bearer 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`, // Replace with your actual API key
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Response from API:", response.data);

      if (response.data && response.data[0]?.generated_text) {
        const aiSuggestions = response.data[0].generated_text.split("\n").filter(Boolean);
        setSuggestions(aiSuggestions);
      } else {
        setSuggestions(["No suggestions generated."]);
      }
      onOpen();
    } catch (error) {
      console.error("❌ AI Suggestion Error:", error.response ? error.response.data : error.message);
      setSuggestions(["Failed to fetch AI suggestions."]);
      onOpen();
    }
  };

  return (
    <Box position="relative">
      <HStack spacing={4} align="start">
        <Box w="50%">
          <LanguageSelector language={language} onSelect={onSelect} />
          <Editor
            options={{
              minimap: { enabled: false },
              quickSuggestions: true,
              parameterHints: { enabled: true },
              suggestOnTriggerCharacters: true,
              autoClosingBrackets: "always",
            }}
            height="75vh"
            theme="vs-dark"
            language={language}
            defaultValue={CODE_SNIPPETS[language]}
            onMount={onMount}
            value={value}
            onChange={(value) => setValue(value)}
          />
        </Box>
        <Output editorRef={editorRef} language={language} />
      </HStack>
      
      {/* AI Suggestion Button */}
      <Button position="absolute" top={2} right={2} colorScheme="blue" onClick={fetchAISuggestions}>
        AI Suggestions
      </Button>
      
      {/* AI Suggestions Sidebar */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>AI Code Suggestions</DrawerHeader>
          <DrawerBody>
            {suggestions.length > 0 ? suggestions.map((s, i) => <Box key={i} p={2} borderBottom="1px solid #ccc">{s}</Box>) : "No suggestions available."}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default CodeEditor;
