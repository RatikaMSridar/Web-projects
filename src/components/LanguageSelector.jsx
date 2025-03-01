import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Flex,
  Image,
} from "@chakra-ui/react";
import { LANGUAGE_VERSIONS } from "../constants";

const languages = Object.entries(LANGUAGE_VERSIONS);
const ACTIVE_COLOR = "blue.400";

const LanguageSelector = ({ language, onSelect }) => {
  return (
    <Flex align="center" justify="space-between" width="100%" mb={4}>
      {/* Language Selector Section */}
      <Box ml={2}>
        <Text mb={2} color="purple.400" fontSize="lg">
          Language:
        </Text>
        <Menu isLazy>
          <MenuButton as={Button}>{language}</MenuButton>
          <MenuList bg="#110c1b">
            {languages.map(([lang, version]) => (
              <MenuItem
                key={lang}
                color={lang === language ? ACTIVE_COLOR : ""}
                bg={lang === language ? "gray.900" : "transparent"}
                _hover={{
                  color: ACTIVE_COLOR,
                  bg: "gray.900",
                }}
                onClick={() => onSelect(lang)}
              >
                {lang}
                &nbsp;
                <Text as="span" color="gray.600" fontSize="sm">
                  ({version})
                </Text>
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </Box>

      {/* Codemonk Logo & Tagline */}
      <Flex align="center" gap={2} mr={100} position="absolute" 
  top="-50px"  // Moves it slightly up
  left="260px">
        <Image src="/codemonk-logo.jpg" alt="Codemonk Logo" boxSize="80px" />
        <Text fontSize="lg" fontWeight="bold" color="red.300">
          Where Creativity Meets Compilation!
        </Text>
      </Flex>
    </Flex>
  );
};

export default LanguageSelector;
