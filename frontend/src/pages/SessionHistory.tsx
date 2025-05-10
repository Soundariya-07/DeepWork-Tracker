import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  Flex,
  useColorModeValue,
  Center,
  Spinner,
  Text,
  SimpleGrid,
  Icon,
  VStack,
  useToast
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { FiClock, FiBarChart2, FiCheckCircle, FiChevronLeft } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';

// StatCard component for displaying session statistics
const StatCard = ({ title, value, icon, helpText, color }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={cardBg} borderColor={borderColor}>
      <Flex align="center" mb={2}>
        <Icon as={icon} color={`${color}.500`} boxSize={5} mr={2} />
        <Text fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.400')}>
          {title}
        </Text>
      </Flex>
      <Text fontSize="2xl" fontWeight="bold">
        {value}
      </Text>
      {helpText && (
        <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mt={1}>
          {helpText}
        </Text>
      )}
    </Box>
  );
};

const SessionHistory = () => {
  const toast = useToast();
  const [sessions, setSessions] = useState([]);
  const [activeSessions, setActiveSessions] = useState([
    {
      id: 'active-1',
      title: 'Active Coding Session',
      goal: 'Complete the current feature',
      status: 'active',
      scheduled_duration: 90,
      started_at: new Date(Date.now() - 20 * 60000).toISOString(), // Started 20 minutes ago
      interruption_count: 0
    },
    {
      id: 'active-2',
      title: 'Paused Debugging Session',
      goal: 'Fix critical bugs in production',
      status: 'paused',
      scheduled_duration: 45,
      started_at: new Date(Date.now() - 45 * 60000).toISOString(), // Started 45 minutes ago
      interruption_count: 2
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // Show notification when active session is running for too long
  useEffect(() => {
    const checkActiveSessions = () => {
      activeSessions.forEach(session => {
        const startTime = new Date(session.started_at);
        const now = new Date();
        const minutesElapsed = Math.floor((now - startTime) / 60000);

        if (session.status === 'active' && minutesElapsed >= 30) {
          toast({
            title: 'Session Running Long',
            description: `${session.title} has been running for ${minutesElapsed} minutes`,
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        }
      });
    };

    const interval = setInterval(checkActiveSessions, 300000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, [activeSessions, toast]);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const formatTime = (minutes) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      // Simulated API response with realistic dates starting from 07/05/2025
      const mockSessions = [
        {
          id: 1,
          title: 'Deep Work Session',
          goal: 'Complete project documentation',
          status: 'completed',
          scheduled_duration: 60,
          completed_at: '2025-05-07T10:00:00',
          interruption_count: 1
        },
        {
          id: 2,
          title: 'Code Review',
          goal: 'Review pull requests',
          status: 'completed',
          scheduled_duration: 45,
          completed_at: '2025-05-07T14:30:00',
          interruption_count: 0
        },
        {
          id: 3,
          title: 'Feature Development',
          goal: 'Implement new API endpoints',
          status: 'completed',
          scheduled_duration: 90,
          completed_at: '2025-05-08T09:15:00',
          interruption_count: 2
        },
        {
          id: 4,
          title: 'Bug Fixing Session',
          goal: 'Fix reported issues',
          status: 'completed',
          scheduled_duration: 30,
          completed_at: '2025-05-08T15:45:00',
          interruption_count: 0
        },
        {
          id: 5,
          title: 'Architecture Planning',
          goal: 'Design system architecture',
          status: 'completed',
          scheduled_duration: 120,
          completed_at: '2025-05-09T11:00:00',
          interruption_count: 3
        }
      ];
      setSessions(mockSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch session history',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const calculateStats = () => {
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const interruptedSessions = sessions.filter(s => s.interruption_count > 0);
    const totalTime = completedSessions.reduce((acc, s) => acc + (s.scheduled_duration || 0), 0);
    const avgDuration = completedSessions.length > 0 ? Math.round(totalTime / completedSessions.length) : 0;
    const completionRate = totalSessions > 0 ? Math.round((completedSessions.length / totalSessions) * 100) : 0;

    return {
      totalSessions,
      completedSessions: completedSessions.length,
      interruptedSessions: interruptedSessions.length,
      totalTime,
      avgDuration,
      completionRate
    };
  };

  const stats = calculateStats();

  const filteredSessions = sessions
    .filter(session => filter === 'all' || session.status === filter)
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.completed_at) - new Date(a.completed_at);
      if (sortBy === 'date-asc') return new Date(a.completed_at) - new Date(b.completed_at);
      if (sortBy === 'duration-desc') return b.scheduled_duration - a.scheduled_duration;
      return a.scheduled_duration - b.scheduled_duration;
    });

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Button
          leftIcon={<Icon as={FiChevronLeft} />}
          variant="ghost"
          as={RouterLink}
          to="/"
        >
          Back to Timer
        </Button>
      </Flex>

      {activeSessions.length > 0 && (
        <Box mb={6} p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor} borderColor={borderColor}>
          <Heading size="md" mb={4}>Active Sessions</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {activeSessions.map((session) => (
              <Box
                key={session.id}
                p={4}
                borderWidth="1px"
                borderRadius="md"
                borderColor={session.status === 'active' ? 'green.500' : 'yellow.500'}
              >
                <VStack align="start" spacing={2}>
                  <Flex justify="space-between" width="100%">
                    <Heading size="sm">{session.title}</Heading>
                    <Badge colorScheme={session.status === 'active' ? 'green' : 'yellow'}>
                      {session.status.toUpperCase()}
                    </Badge>
                  </Flex>
                  <Text color="gray.500" fontSize="sm">{session.goal}</Text>
                  <Flex justify="space-between" width="100%" fontSize="sm">
                    <Text>Duration: {formatTime(session.scheduled_duration)}</Text>
                    <Text>Started: {formatDate(session.started_at)}</Text>
                  </Flex>
                  {session.interruption_count > 0 && (
                    <Text fontSize="sm" color="orange.500">
                      Interruptions: {session.interruption_count}
                    </Text>
                  )}
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      )}

      <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor} borderColor={borderColor}>
        <Flex direction="column" gap={6}>
          <Flex justify="space-between" align="center">
            <Heading size="lg">Session History</Heading>
            <Flex gap={4}>
              <Select value={filter} onChange={(e) => setFilter(e.target.value)} w="200px">
                <option value="all">All Sessions</option>
                <option value="completed">Completed</option>
                <option value="interrupted">Interrupted</option>
              </Select>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} w="200px">
                <option value="date-desc">Latest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="duration-desc">Longest First</option>
                <option value="duration-asc">Shortest First</option>
              </Select>
            </Flex>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
            <StatCard
              title="Total Deep Work Time"
              value={formatTime(stats.totalTime)}
              icon={FiClock}
              helpText={`Across ${stats.completedSessions} completed sessions`}
              color="blue"
            />
            <StatCard
              title="Average Session Duration"
              value={formatTime(stats.avgDuration)}
              icon={FiBarChart2}
              helpText="For completed sessions"
              color="green"
            />
            <StatCard
              title="Completion Rate"
              value={`${stats.completionRate}%`}
              icon={FiCheckCircle}
              helpText={`${stats.completedSessions} of ${stats.totalSessions} sessions completed`}
              color="purple"
            />
          </SimpleGrid>

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
              {filteredSessions.map((session) => (
                <Tr key={session.id}>
                  <Td>{session.title}</Td>
                  <Td>{session.goal}</Td>
                  <Td>
                    <Badge colorScheme={session.status === 'completed' ? 'green' : 'yellow'}>
                      {session.status.toUpperCase()}
                    </Badge>
                  </Td>
                  <Td>{formatDate(session.completed_at)}</Td>
                  <Td>{formatTime(session.scheduled_duration)}</Td>
                  <Td>{session.interruption_count}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Flex>
      </Box>
    </Box>
  );
};

export default SessionHistory;
