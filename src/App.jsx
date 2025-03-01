import { Box, Button, useColorMode } from "@chakra-ui/react";
import CodeEditor from "./components/CodeEditor";

function App() {
  const { colorMode, toggleColorMode } = useColorMode(); // Theme toggle

  return (
    <Box minH="100vh" bg={colorMode === "light" ? "gray.100" : "#0f0a19"} color="gray.500" px={6} py={8}>
      {/* Theme Toggle Button */}
      <Button onClick={toggleColorMode} mb={4}>
        {colorMode === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
      </Button>

      {/* Code Editor */}
      <CodeEditor />
    </Box>
  );
}

export default App;
