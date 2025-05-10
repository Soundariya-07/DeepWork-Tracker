import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Badge,
  Flex,
  Center,
  Spinner,
  Text,
  SimpleGrid,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  useColorModeValue
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { FiClock, FiBarChart2, FiCheckCircle, FiChevronLeft, FiInfo } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

const StatCard = ({ title, value, icon, helpText, color }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box p={4} bg={cardBg} borderWidth="1px" borderRadius="lg" borderColor={borderColor}>
      <Flex align="center" mb={2}>
        <Icon as={icon} color={`${color}.500`} boxSize={5} mr={2} />
        <Text color={textColor} fontSize="sm">{title}</Text>
      </Flex>
      <Text fontSize="2xl" fontWeight="bold" mb={1}>{value}</Text>
      {helpText && <Text fontSize="sm" color={textColor}>{helpText}</Text>}
    </Box>
  );
};

const SessionHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get('http://localhost:8090/sessions');
        setSessions(response.data);
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

    fetchSessions();
  }, [toast]);

  const calculateStats = () => {
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const totalSessions = sessions.length;
    const totalTime = completedSessions.reduce((acc, s) => acc + (s.scheduled_duration || 0), 0);
    const avgDuration = completedSessions.length > 0 ? totalTime / completedSessions.length : 0;
    const completionRate = totalSessions > 0 ? (completedSessions.length / totalSessions) * 100 : 0;

    return {
      totalSessions,
      completedSessions: completedSessions.length,
      totalTime,
      avgDuration,
      completionRate
    };
  };

  const formatTime = (minutes) => {
    if (!minutes || minutes === 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  const stats = calculateStats();

  return (
    <Box p={5} bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh">
      <Button
        as={RouterLink}
        to="/"
        leftIcon={<FiChevronLeft />}
        mb={6}
        variant="ghost"
        color={useColorModeValue('gray.800', 'gray.400')}
        _hover={{ color: useColorModeValue('gray.600', 'white') }}
      >
        Back to Timer
      </Button>

      <Heading mb={6} color={useColorModeValue('gray.800', 'white')}>Session History</Heading>

      <SimpleGrid columns={[1, null, 3]} spacing={6} mb={8}>
        <StatCard
          title="Total Deep Work Time"
          value={formatTime(stats.totalTime)}
          icon={FiClock}
          color="blue"
          helpText={`Across ${stats.completedSessions} completed sessions`}
        />
        <StatCard
          title="Average Session Duration"
          value={formatTime(stats.avgDuration)}
          icon={FiBarChart2}
          color="green"
          helpText="For completed sessions"
        />
        <StatCard
          title="Completion Rate"
          value={`${Math.round(stats.completionRate)}%`}
          icon={FiCheckCircle}
          color="purple"
          helpText={`${stats.completedSessions} of ${stats.totalSessions} sessions completed`}
        />
      </SimpleGrid>

      <Box overflowX="auto" bg={useColorModeValue('white', 'gray.800')} borderRadius="lg" shadow="sm" mb={8}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Title</Th>
              <Th>Goal</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th>Duration</Th>
              <Th>Interruptions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sessions.map((session) => (
              <Tr key={session.id}>
                <Td fontWeight="medium">{session.title}</Td>
                <Td>{session.goal || 'N/A'}</Td>
                <Td>
                  <Badge
                    colorScheme={
                      session.status === 'completed' ? 'green' :
                      session.status === 'active' ? 'blue' :
                      session.status === 'paused' ? 'orange' : 'gray'
                    }
                  >
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </Badge>
                </Td>
                <Td>{formatDate(session.completed_at || session.created_at)}</Td>
                <Td>{formatTime(session.scheduled_duration)}</Td>
                <Td>{session.interruption_count || 0}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Box
        mt={8}
        p={5}
        shadow="md"
        borderWidth="1px"
        borderRadius="lg"
        bg={useColorModeValue('blue.50', 'blue.900')}
        borderColor={useColorModeValue('blue.200', 'blue.700')}
      >
        <Flex align="center" mb={2}>
          <Icon as={FiInfo} mr={2} color="blue.500" />
          <Heading size="sm">Deep Work Tips</Heading>
        </Flex>
        <Text fontSize="sm">
          Research shows that most people can sustain about 4 hours of deep work per day. 
          Try to schedule your deep work sessions during your peak productivity hours and 
          keep track of what causes interruptions to minimize them in the future.
        </Text>
      </Box>
    </Box>
  );
};

const sessionData = [
  {
    title: 'Research Machine Learning',
    goal: 'Research new ML techniques',
    status: 'scheduled',
    scheduled_duration: 45
  },
  {
    title: 'Write project documentation',
    goal: 'Complete API documentation section',
    status: 'completed',
    scheduled_duration: 45
  }
];

export default SessionHistory;
