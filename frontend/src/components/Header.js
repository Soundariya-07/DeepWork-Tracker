import React from 'react';
import {
  Flex,
  IconButton,
  useColorMode,
  useColorModeValue,
  Heading,
  Spacer,
  Box,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { FiMoon, FiSun, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import Notifications from './Notifications';

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const location = useLocation();
  
  // Get the page title based on the current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/tasks') return 'Tasks';
    if (path.startsWith('/tasks/')) return 'Task Details';
    if (path === '/timer') return 'Pomodoro Timer';
    if (path === '/statistics') return 'Statistics';
    if (path === '/settings') return 'Settings';
    return 'DeepWork';
  };

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      w="full"
      px={4}
      py={4}
      bg={useColorModeValue('white', 'gray.800')}
      borderBottomWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      h="16"
      ml={{ base: '60px', md: '240px' }}
    >
      <Heading size="md" fontWeight="semibold">
        {getPageTitle()}
      </Heading>
      
      <Spacer />
      
      <Flex align="center">
        <IconButton
          aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
          variant="ghost"
          color={useColorModeValue('gray.600', 'gray.300')}
          onClick={toggleColorMode}
          icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
          size="md"
          mr={4}
        />
        
        {/* Notifications */}
        <Box mr={4} position="relative">
          <Box
            position="absolute"
            top="-5px"
            right="-5px"
            zIndex="2"
            borderRadius="full"
            bg="red.500"
            w="15px"
            h="15px"
            animation="pulse 2s infinite"
          />
          <Notifications />
          <style jsx>{`
            @keyframes pulse {
              0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7); }
              70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(255, 82, 82, 0); }
              100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 82, 82, 0); }
            }
          `}</style>
        </Box>
        
        <Menu>
          <MenuButton
            as={Box}
            rounded="full"
            cursor="pointer"
          >
            <Avatar
              size="sm"
              bg="brand.500"
              color="white"
              name="User"
              src=""
            />
          </MenuButton>
          <MenuList>
            <MenuItem icon={<FiUser />}>Profile</MenuItem>
            <MenuItem icon={<FiSettings />}>Account Settings</MenuItem>
            <MenuItem icon={<FiLogOut />}>Sign Out</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
};

export default Header;
