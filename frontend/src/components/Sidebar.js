import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  VStack,
  Icon,
  Text,
  Link,
  Divider,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { FiHome, FiList, FiClock, FiBarChart2, FiSettings, FiPlay, FiCalendar } from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Navigation items
  const navItems = [
    { name: 'Dashboard', icon: FiHome, path: '/' },
    { name: 'Sessions', icon: FiList, path: '/sessions' },
    { name: 'Active Session', icon: FiPlay, path: '/active-session' },
    { name: 'Session History', icon: FiCalendar, path: '/history' },
    { name: 'Settings', icon: FiSettings, path: '/settings' },
  ];
  
  return (
    <Box
      as="nav"
      pos="fixed"
      top="0"
      left="0"
      zIndex="sticky"
      h="full"
      pb="10"
      overflowX="hidden"
      overflowY="auto"
      bg={bgColor}
      borderRight="1px"
      borderRightColor={borderColor}
      w="60"
      display={{ base: 'none', md: 'block' }}
    >
      <Flex px="4" py="5" align="center">
        <Text
          fontSize="2xl"
          fontWeight="semibold"
          bgGradient="linear(to-r, brand.400, brand.600)"
          bgClip="text"
        >
          DeepWork
        </Text>
      </Flex>
      <Divider borderColor={borderColor} />
      <Flex
        direction="column"
        as="nav"
        fontSize="sm"
        color="gray.600"
        aria-label="Main Navigation"
        p="4"
      >
        <VStack align="stretch" spacing="1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.name}
                as={RouterLink}
                to={item.path}
                p="3"
                borderRadius="md"
                _hover={{
                  bg: 'brand.50',
                  color: 'brand.500',
                }}
                bg={isActive ? 'brand.50' : 'transparent'}
                color={isActive ? 'brand.500' : 'inherit'}
                fontWeight={isActive ? 'semibold' : 'normal'}
              >
                <Flex align="center" justify="space-between">
                  <Flex align="center">
                    <Icon as={item.icon} boxSize="5" mr="3" />
                    <Text>{item.name}</Text>
                  </Flex>
                  
                  {item.name === 'Active Session' && (
                    <Badge colorScheme="green" variant="solid" borderRadius="full" px={2}>
                      Focus
                    </Badge>
                  )}
                </Flex>
              </Link>
            );
          })}
        </VStack>
      </Flex>

    </Box>
  );
};

export default Sidebar;
