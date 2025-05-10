import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Icon,
  useColorModeValue,
  Badge,
  HStack,
  Spinner,
  Center,
  useToast,
} from '@chakra-ui/react';
import { 
  FiClock, 
  FiCalendar, 
  FiPlay, 
  FiPause, 
  FiCheck, 
  FiPlus, 
  FiBarChart2, 
  FiAlertCircle 
} from 'react-icons/fi';
import { sessionApi } from '../services/api';

// Session card component
const SessionCard = ({ session, onStart }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const navigate = useNavigate();
  
  // Get color based on session status
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'gray';
      case 'active': return 'green';
      case 'paused': return 'orange';
      case 'completed': return 'blue';
      case 'interrupted': return 'red';
      case 'abandoned': return 'red';
      case 'overdue': return 'purple';
      default: return 'gray';
    }
  };
  
  // Get formatted time display
  const getTimeDisplay = (duration) => {
    return `${duration} min`;
  };
  
  // Handle session click
  const handleSessionClick = () => {
    if (session.status === 'active' || session.status === 'paused') {
      navigate(`/active-session/${session.id}`);
    } else if (session.status === 'scheduled') {
      onStart(session.id);
    } else {
      navigate(`/sessions/${session.id}`);
    }
  };
  
  return (
    <Box
      p={5}
      shadow="md"
      borderWidth="1px"
      borderRadius="lg"
      bg={cardBg}
      borderColor={borderColor}
      transition="all 0.3s"
      _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
      cursor="pointer"
      onClick={handleSessionClick}
    >
      <Flex justify="space-between" align="center" mb={2}>
        <Heading size="md" fontWeight="semibold" isTruncated>
          {session.title}
        </Heading>
        <Badge colorScheme={getStatusColor(session.status)}>
          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
        </Badge>
      </Flex>
      
      <Text noOfLines={2} mb={3} color={useColorModeValue('gray.600', 'gray.400')}>
        {session.goal || 'No goal specified'}
      </Text>
      
      <Flex justify="space-between" align="center">
        <HStack spacing={1}>
          <Icon as={FiClock} color={useColorModeValue('gray.500', 'gray.400')} />
          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
            {getTimeDisplay(session.scheduled_duration)}
          </Text>
        </HStack>
        
        {session.status === 'scheduled' && (
          <Button
            size="sm"
            leftIcon={<Icon as={FiPlay} />}
            colorScheme="green"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onStart(session.id);
            }}
          >
            Start
          </Button>
        )}
        
        {session.status === 'active' && (
          <Button
            size="sm"
            leftIcon={<Icon as={FiPause} />}
            colorScheme="orange"
            variant="outline"
          >
            Pause
          </Button>
        )}
        
        {session.status === 'paused' && (
          <Button
            size="sm"
            leftIcon={<Icon as={FiPlay} />}
            colorScheme="green"
            variant="outline"
          >
            Resume
          </Button>
        )}
      </Flex>
    </Box>
  );
};

// Stats card component
const StatCard = ({ title, value, helpText, icon, color }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box
      p={5}
      shadow="md"
      borderWidth="1px"
      borderRadius="lg"
      bg={cardBg}
      borderColor={borderColor}
    >
      <Flex align="center" mb={2}>
        <Box
          bg={`${color}.100`}
          p={2}
          borderRadius="md"
          color={`${color}.500`}
          mr={3}
        >
          <Icon as={icon} boxSize={6} />
        </Box>
        <Text fontSize="sm" fontWeight="medium">
          {title}
        </Text>
      </Flex>
      
      <Text fontSize="3xl" fontWeight="bold">
        {value}
      </Text>
      
      {helpText && (
        <Text fontSize="sm" color="gray.500">
          {helpText}
        </Text>
      )}
    </Box>
  );
};

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTime: 0,
    completedSessions: 0,
    avgDuration: 0,
    completionRate: 0
  });
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:8090/sessions');
        setSessions(response.data);
        // Calculate stats from sessions
        const completedSessions = response.data.filter(s => s.status === 'completed');
        const totalSessions = response.data.length;
        const totalTime = completedSessions.reduce((acc, s) => acc + (s.scheduled_duration || 0), 0);
        const avgDuration = completedSessions.length > 0 ? totalTime / completedSessions.length : 0;
        const completionRate = totalSessions > 0 ? (completedSessions.length / totalSessions) * 100 : 0;
        
        setStats({
          totalTime,
          completedSessions: completedSessions.length,
          avgDuration,
          completionRate
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        toast({
          title: 'Error fetching sessions',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  const navigate = useNavigate();
  
  // Theme values
  
  // Format time duration
  const formatTime = (minutes) => {
    if (!minutes || minutes === 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };
  
  // Handle session action (pause/resume)
  const handleSessionAction = (session) => {
    // TODO: Implement session actions
    console.log('Session action:', session);
  };
  
  // Fetch data on component mount
  useEffect(() => {
    setIsLoading(false);
  }, []);
  
  // Handle session start
  const handleStartSession = async (sessionId) => {
    try {
      await sessionApi.startSession(sessionId);
      toast({
        title: 'Session started',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      navigate(`/active-session/${sessionId}`);
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: 'Error starting session',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }
  
  return (
    <Box p={4}>
      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={8}>
        <Box
          p={4}
          shadow="md"
          borderWidth="1px"
          borderRadius="lg"
          bg={useColorModeValue('white', 'gray.800')}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          <Flex align="center" mb={2}>
            <Icon as={FiClock} mr={2} color="blue.500" />
            <Text fontSize="sm">Total Deep Work</Text>
          </Flex>
          <Heading size="lg">0h 0m</Heading>
          <Text fontSize="xs" color="gray.500">Across 6 sessions</Text>
        </Box>
        
        <Box
          p={4}
          shadow="md"
          borderWidth="1px"
          borderRadius="lg"
          bg={useColorModeValue('white', 'gray.800')}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          <Flex align="center" mb={2}>
            <Icon as={FiPlay} mr={2} color="green.500" />
            <Text fontSize="sm">Active Sessions</Text>
          </Flex>
          <Heading size="lg">2</Heading>
          <Text fontSize="xs" color="gray.500"></Text>
        </Box>
        
        <Box
          p={4}
          shadow="md"
          borderWidth="1px"
          borderRadius="lg"
          bg={useColorModeValue('white', 'gray.800')}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          <Flex align="center" mb={2}>
            <Icon as={FiCheck} mr={2} color="green.500" />
            <Text fontSize="sm">Completion Rate</Text>
          </Flex>
          <Heading size="lg">57%</Heading>
          <Text fontSize="xs" color="gray.500"></Text>
        </Box>
        
        <Box
          p={4}
          shadow="md"
          borderWidth="1px"
          borderRadius="lg"
          bg={useColorModeValue('white', 'gray.800')}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          <Flex align="center" mb={2}>
            <Icon as={FiCalendar} mr={2} color="purple.500" />
            <Text fontSize="sm">Scheduled</Text>
          </Flex>
          <Heading size="lg">3</Heading>
          <Text fontSize="xs" color="gray.500"></Text>
        </Box>
      </SimpleGrid>
      
      {/* Active Sessions */}
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">
            <Flex align="center">
              <Icon as={FiPlay} mr={2} color="green.500" />
              Active Sessions
            </Flex>
          </Heading>
          <Button
            as={RouterLink}
            to="/sessions"
            variant="ghost"
            size="sm"
            rightIcon={<Icon as={FiPlus} />}
          >
            View All
          </Button>
        </Flex>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} spacing={5}>
          {sessions.filter(session => session.status === 'active' || session.status === 'paused').map((session) => (
            <Box
              key={session.id}
              p={5}
              shadow="md"
              borderWidth="1px"
              borderRadius="lg"
              bg={useColorModeValue('white', 'gray.800')}
              borderColor={useColorModeValue('gray.200', 'gray.700')}
            >
              <Flex justify="space-between" align="center" mb={2}>
                <Heading size="md" fontWeight="semibold" isTruncated>
                  {session.title}
                </Heading>
                <Badge colorScheme={session.status === 'active' ? 'green' : 'orange'}>
                  {session.status.toUpperCase()}
                </Badge>
              </Flex>
              <Text mb={3}>{session.goal || 'No goal set'}</Text>
              <Flex align="center" mb={2}>
                <Icon as={FiClock} mr={2} />
                <Text>{formatTime(session.scheduled_duration)}</Text>
              </Flex>
              <Button
                colorScheme={session.status === 'active' ? 'blue' : 'green'}
                size="sm"
                leftIcon={<Icon as={session.status === 'active' ? FiPause : FiPlay} />}
                onClick={() => handleSessionAction(session)}
              >
                {session.status === 'active' ? 'Pause' : 'Resume'}
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
      {/* Scheduled Sessions */}
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">
            <Flex align="center">
              <Icon as={FiCalendar} mr={2} color="purple.500" />
              Upcoming Sessions
            </Flex>
          </Heading>
          <Button
            as={RouterLink}
            to="/sessions"
            variant="ghost"
            size="sm"
            rightIcon={<Icon as={FiBarChart2} />}
          >
            View All
          </Button>
        </Flex>
        
        {sessions.filter(session => session.status === 'scheduled').length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
            {sessions.filter(session => session.status === 'scheduled').slice(0, 3).map(session => (
              <SessionCard
                key={session.id}
                session={session}
                onStart={handleStartSession}
              />
            ))}
          </SimpleGrid>
        ) : (
          <Box
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="lg"
            bg={useColorModeValue('white', 'gray.800')}
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            textAlign="center"
          >
            <Icon as={FiAlertCircle} boxSize={10} color="gray.400" mb={3} />
            <Text mb={3}>No scheduled sessions found</Text>
            <Button
              as={RouterLink}
              to="/sessions"
              colorScheme="brand"
              leftIcon={<Icon as={FiPlus} />}
            >
              Schedule Your First Session
            </Button>
          </Box>
        )}
      </Box>
      
      {/* Recent Sessions */}
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">
            <Flex align="center">
              <Icon as={FiClock} mr={2} color="blue.500" />
              Recent Sessions
            </Flex>
          </Heading>
          <Button
            as={RouterLink}
            to="/sessions"
            variant="ghost"
            size="sm"
            rightIcon={<Icon as={FiBarChart2} />}
          >
            View All
          </Button>
        </Flex>
        
        {sessions.filter(session => session.status === 'completed').length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
            {sessions.filter(session => session.status === 'completed').map(session => (
              <SessionCard
                key={session.id}
                session={session}
                onStart={handleStartSession}
              />
            ))}
          </SimpleGrid>
        ) : (
          <Box
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="lg"
            bg={useColorModeValue('white', 'gray.800')}
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            textAlign="center"
          >
            <Icon as={FiAlertCircle} boxSize={10} color="gray.400" mb={3} />
            <Text mb={3}>No recent sessions found</Text>
            <Button
              as={RouterLink}
              to="/sessions"
              colorScheme="brand"
              leftIcon={<Icon as={FiPlus} />}
            >
              Start Your First Session
            </Button>
          </Box>
        )}
      </Box>
      
      <Box>
        <Heading size="md" mb={4}>Quick Actions</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
          <Button
            as={RouterLink}
            to="/sessions"
            size="lg"
            height="100px"
            colorScheme="green"
            leftIcon={<Icon as={FiPlay} boxSize={5} />}
          >
            Start Deep Work Session
          </Button>
          <Button
            as={RouterLink}
            to="/history"
            size="lg"
            height="100px"
            colorScheme="blue"
            leftIcon={<Icon as={FiBarChart2} boxSize={5} />}
          >
            View Session History
          </Button>
          <Button
            as={RouterLink}
            to="/settings"
            size="lg"
            height="100px"
            colorScheme="purple"
            leftIcon={<Icon as={FiClock} boxSize={5} />}
          >
            Manage Settings
          </Button>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default Dashboard;
