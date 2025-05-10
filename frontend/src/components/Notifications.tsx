import React, { useState } from 'react';
import {
  Box,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  VStack,
  Text,
  Badge,
  Icon,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiBell } from 'react-icons/fi';

interface Notification {
  id: string;
  type: 'reminder' | 'alert' | 'info';
  message: string;
  timestamp: string;
  read: boolean;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'reminder',
      message: 'Time to take a break! You\'ve been working for 2 hours.',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      read: false,
    },
    {
      id: '2',
      type: 'alert',
      message: 'Your current session has 3 interruptions.',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      read: false,
    },
    {
      id: '3',
      type: 'info',
      message: 'Great job! You completed 5 deep work sessions this week.',
      timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const bgColor = useColorModeValue('white', 'gray.800');

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reminder':
        return 'blue';
      case 'alert':
        return 'red';
      case 'info':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Button variant="ghost" position="relative">
          <Icon as={FiBell} boxSize={6} />
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="-1"
              right="-1"
              colorScheme="red"
              borderRadius="full"
              minW="5"
              fontSize="xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent width="350px">
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>
          <Flex justify="space-between" align="center">
            <Text fontWeight="bold">Notifications</Text>
            {unreadCount > 0 && (
              <Button size="sm" variant="ghost" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </Flex>
        </PopoverHeader>
        <PopoverBody maxH="400px" overflowY="auto">
          <VStack spacing={3} align="stretch">
            {notifications.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={4}>
                No notifications
              </Text>
            ) : (
              notifications.map(notification => (
                <Box
                  key={notification.id}
                  p={3}
                  borderRadius="md"
                  bg={notification.read ? bgColor : useColorModeValue('gray.50', 'gray.700')}
                  borderWidth="1px"
                  borderColor={useColorModeValue('gray.200', 'gray.600')}
                >
                  <Flex justify="space-between" align="start" mb={1}>
                    <Badge colorScheme={getTypeColor(notification.type)}>
                      {notification.type}
                    </Badge>
                    <Text fontSize="xs" color="gray.500">
                      {formatTimestamp(notification.timestamp)}
                    </Text>
                  </Flex>
                  <Text fontSize="sm">{notification.message}</Text>
                </Box>
              ))
            )}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default Notifications;
