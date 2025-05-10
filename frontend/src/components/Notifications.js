import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Badge,
  Divider,
  useColorModeValue,
  Flex,
  Button,
} from '@chakra-ui/react';
import { FiBell, FiCheck, FiClock, FiAlertCircle } from 'react-icons/fi';

// Sample notifications data
const sampleNotifications = [
  {
    id: 1,
    type: 'reminder',
    message: 'Your "Active Coding Session" has been running for 20 minutes',
    time: new Date().toISOString(),
    read: false
  },
  {
    id: 2,
    type: 'alert',
    message: 'Your "Paused Debugging Session" has been paused for 25 minutes',
    time: new Date(Date.now() - 5 * 60000).toISOString(),
    read: false
  },
  {
    id: 3,
    type: 'info',
    message: 'You completed "API Documentation" session',
    time: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
    read: true
  }
];

const Notifications = () => {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
  // Calculate unread count
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);
  
  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };
  
  // Format time
  const formatTime = (timeString) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };
  
  // Get icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case 'reminder':
        return <FiClock />;
      case 'alert':
        return <FiAlertCircle color="orange" />;
      case 'info':
      default:
        return <FiCheck color="green" />;
    }
  };
  
  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Box position="relative" display="inline-block">
          <IconButton
            aria-label="Notifications"
            icon={<FiBell />}
            variant="ghost"
            size="md"
          />
          {unreadCount > 0 && (
            <Badge
              colorScheme="red"
              borderRadius="full"
              position="absolute"
              top="-2px"
              right="-2px"
              fontSize="xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent width="320px" shadow="lg">
        <PopoverArrow />
        <PopoverHeader fontWeight="semibold">
          <Flex justify="space-between" align="center">
            <Text>Notifications</Text>
            {unreadCount > 0 && (
              <Button size="xs" variant="link" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </Flex>
        </PopoverHeader>
        <PopoverCloseButton />
        <PopoverBody p={0} maxH="400px" overflowY="auto">
          {notifications.length === 0 ? (
            <Box p={4} textAlign="center">
              <Text color="gray.500">No notifications</Text>
            </Box>
          ) : (
            <VStack spacing={0} align="stretch">
              {notifications.map((notification) => (
                <Box
                  key={notification.id}
                  p={3}
                  bg={notification.read ? 'transparent' : hoverBg}
                  _hover={{ bg: hoverBg }}
                  borderBottomWidth="1px"
                  borderColor={borderColor}
                  onClick={() => markAsRead(notification.id)}
                  cursor="pointer"
                >
                  <HStack spacing={3} align="flex-start">
                    <Box pt={1}>
                      {getIcon(notification.type)}
                    </Box>
                    <VStack spacing={1} align="start" flex={1}>
                      <Text fontSize="sm">{notification.message}</Text>
                      <Text fontSize="xs" color="gray.500">
                        {formatTime(notification.time)}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default Notifications;
