import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",  // Default to dark mode
    useSystemColorMode: false, // Allows manual toggling
  },
});

export default theme;
