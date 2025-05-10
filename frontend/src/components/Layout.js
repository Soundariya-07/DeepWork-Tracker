import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Flex, useColorMode } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const { colorMode } = useColorMode();

  return (
    <Flex direction="row" h="100vh">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <Box 
        flex="1" 
        bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'} 
        overflowY="auto"
      >
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <Box as="main" p={4} maxW="1400px" mx="auto">
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};

export default Layout;
