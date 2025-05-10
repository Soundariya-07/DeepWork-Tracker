import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Select,
  Button,
  HStack,
  VStack,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from '@chakra-ui/react';
import { FiClock, FiCalendar, FiBarChart2, FiPieChart, FiShare } from 'react-icons/fi';
import { sessionApi } from '../services/api';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Statistics = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [taskStats, setTaskStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  
  // Fetch stats on component mount and when timeRange changes
  useEffect(() => {
    fetchStats();
  }, [timeRange]);
  
  // Fetch statistics from API
  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch session history
      const response = await sessionApi.getSessionHistory();
      console.log('Session history response:', response);
      const sessions = response.data || [];
      
      // Make sure durations are properly set
      const processedSessions = sessions.map(session => ({
        ...session,
        actual_duration: session.actual_duration || 0,
        scheduled_duration: session.scheduled_duration || 0
      }));
      
      // Store the full session history
      setSessionHistory(processedSessions);
      
      // Process session history data
      if (sessions && sessions.length > 0) {
        // Basic task stats
        const completedSessions = sessions.filter(s => s.status === 'completed');
        const totalTime = completedSessions.reduce((sum, s) => sum + (s.actual_duration || 0), 0);
        const avgTime = completedSessions.length > 0 ? Math.round(totalTime / completedSessions.length) : 0;
        
        setTaskStats({
          total_sessions: sessions.length,
          completed_sessions: completedSessions.length,
          total_time: totalTime,
          avg_duration: avgTime,
          completion_rate: sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0
        });
        
        // Set daily stats (simplified)
        setDailyStats(sessions.map(session => ({
          date: session.completed_at || session.created_at,
          total_time: session.actual_duration || session.scheduled_duration || 0
        })));
      } else {
        // No data
        setTaskStats({
          total_sessions: 0,
          completed_sessions: 0,
          total_time: 0,
          avg_duration: 0,
          completion_rate: 0
        });
        setDailyStats([]);
        setSessionHistory([]);
      }
      
      // Simplified category stats (just use session titles as categories)
      const categories = {};
      if (sessions && sessions.length > 0) {
        sessions.forEach(session => {
          const category = session.title.split(' ')[0]; // Use first word as category
          if (!categories[category]) {
            categories[category] = {
              category,
              total_time: 0,
              task_count: 0,
              completion_rate: 0,
              color: `#${Math.floor(Math.random()*16777215).toString(16)}` // Random color
            };
          }
          categories[category].total_time += (session.actual_duration || session.scheduled_duration || 0);
          categories[category].task_count += 1;
        });
      }
      setCategoryStats(Object.values(categories));
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Convert time range to days
  const timeRangeToDays = (range) => {
    switch (range) {
      case 'day': return 1;
      case 'week': return 7;
      case 'month': return 30;
      case 'year': return 365;
      default: return 7;
    }
  };
  
  // Format minutes to hours and minutes
  const formatTime = (minutes) => {
    if (!minutes || minutes === 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };
  
  // Prepare data for daily time chart
  const getDailyTimeChartData = () => {
    const days = timeRangeToDays(timeRange);
    const today = new Date();
    
    // Generate dates for the selected time range
    const dates = Array.from({ length: days }, (_, i) => {
      const date = subDays(today, days - 1 - i);
      return format(date, 'MMM d');
    });
    
    // Map daily stats to the dates
    const timeData = dates.map(dateStr => {
      const stat = dailyStats.find(s => format(new Date(s.date), 'MMM d') === dateStr);
      return stat ? stat.total_time : 0;
    });
    
    // Convert minutes to hours for better visualization
    const timeDataInHours = timeData.map(minutes => Math.round(minutes / 60 * 100) / 100);
    
    return {
      labels: dates,
      datasets: [
        {
          label: 'Hours Worked',
          data: timeDataInHours,
          backgroundColor: '#FFD166',
          borderColor: '#FFD166',
          borderWidth: 1,
          borderRadius: 6,
        }
      ]
    };
  };
  
  // Prepare data for category distribution chart
  const getCategoryChartData = () => {
    return {
      labels: categoryStats.map(cat => cat.category),
      datasets: [
        {
          label: 'Time Spent (minutes)',
          data: categoryStats.map(cat => cat.total_time),
          backgroundColor: categoryStats.map(cat => cat.color || '#4ECDC4'),
          borderColor: useColorModeValue('white', 'gray.800'),
          borderWidth: 2,
        }
      ]
    };
  };
  
  // Chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: useColorModeValue('#1A202C', '#FFFFFF'),
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw} hours`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: useColorModeValue('#1A202C', '#FFFFFF'),
        },
        grid: {
          color: useColorModeValue('rgba(0,0,0,0.1)', 'rgba(255,255,255,0.1)'),
        }
      },
      x: {
        ticks: {
          color: useColorModeValue('#1A202C', '#FFFFFF'),
        },
        grid: {
          display: false,
        }
      }
    }
  };
  
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: useColorModeValue('#1A202C', '#FFFFFF'),
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${formatTime(value)} (${percentage}%)`;
          }
        }
      }
    }
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Statistics</Heading>
        <HStack spacing={4}>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            width="150px"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </Select>
          <Button
            leftIcon={<Icon as={FiShare} />}
            colorScheme="brand"
            variant="outline"
          >
            Share
          </Button>
        </HStack>
      </Flex>
      
      {/* Overview Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={8}>
        <Box
          p={5}
          shadow="md"
          borderWidth="1px"
          borderRadius="lg"
          bg={bgColor}
          borderColor={borderColor}
        >
          <Stat>
            <StatLabel color={textColor}>Total Tasks</StatLabel>
            <StatNumber>{taskStats?.total_tasks || 0}</StatNumber>
            <StatHelpText>
              {taskStats?.completed_tasks || 0} completed
            </StatHelpText>
          </Stat>
        </Box>
        
        <Box
          p={5}
          shadow="md"
          borderWidth="1px"
          borderRadius="lg"
          bg={bgColor}
          borderColor={borderColor}
        >
          <Stat>
            <StatLabel color={textColor}>Time Spent</StatLabel>
            <StatNumber>{formatTime(taskStats?.total_time_spent || 0)}</StatNumber>
            <StatHelpText>
              <Icon as={FiClock} mr={1} />
              {timeRange === 'day' ? 'Today' : timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : 'This Year'}
            </StatHelpText>
          </Stat>
        </Box>
        
        <Box
          p={5}
          shadow="md"
          borderWidth="1px"
          borderRadius="lg"
          bg={bgColor}
          borderColor={borderColor}
        >
          <Stat>
            <StatLabel color={textColor}>Completion Rate</StatLabel>
            <StatNumber>{Math.round(taskStats?.completion_rate || 0)}%</StatNumber>
            <StatHelpText>
              {taskStats?.completed_tasks || 0} / {taskStats?.total_tasks || 0} tasks
            </StatHelpText>
          </Stat>
        </Box>
        
        <Box
          p={5}
          shadow="md"
          borderWidth="1px"
          borderRadius="lg"
          bg={bgColor}
          borderColor={borderColor}
        >
          <Stat>
            <StatLabel color={textColor}>Daily Average</StatLabel>
            <StatNumber>
              {formatTime(Math.round((taskStats?.total_time_spent || 0) / timeRangeToDays(timeRange)))}
            </StatNumber>
            <StatHelpText>
              <Icon as={FiCalendar} mr={1} />
              Per day
            </StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>
      
      {/* Charts */}
      <Tabs variant="soft-rounded" colorScheme="brand" mb={8}>
        <TabList mb={4}>
          <Tab><Icon as={FiBarChart2} mr={2} /> Time Distribution</Tab>
          <Tab><Icon as={FiPieChart} mr={2} /> Categories</Tab>
        </TabList>
        
        <TabPanels>
          {/* Daily Time Chart */}
          <TabPanel p={0}>
            <Box
              p={5}
              shadow="md"
              borderWidth="1px"
              borderRadius="lg"
              bg={bgColor}
              borderColor={borderColor}
              height="400px"
            >
              {dailyStats.length > 0 ? (
                <Bar data={getDailyTimeChartData()} options={barChartOptions} />
              ) : (
                <Flex height="100%" align="center" justify="center">
                  <Text color={textColor}>No data available for the selected time range</Text>
                </Flex>
              )}
            </Box>
          </TabPanel>
          
          {/* Category Distribution Chart */}
          <TabPanel p={0}>
            <Box
              p={5}
              shadow="md"
              borderWidth="1px"
              borderRadius="lg"
              bg={bgColor}
              borderColor={borderColor}
              height="400px"
            >
              {categoryStats.length > 0 ? (
                <Pie data={getCategoryChartData()} options={pieChartOptions} />
              ) : (
                <Flex height="100%" align="center" justify="center">
                  <Text color={textColor}>No category data available for the selected time range</Text>
                </Flex>
              )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Category Details */}
      <Box mb={8}>
        <Heading size="md" mb={4}>Category Breakdown</Heading>
        
        {categoryStats.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
            {categoryStats.map((category) => (
              <Box
                key={category.category}
                p={5}
                shadow="md"
                borderWidth="1px"
                borderRadius="lg"
                bg={bgColor}
                borderColor={borderColor}
              >
                <Flex align="center" mb={3}>
                  <Box
                    w={3}
                    h={3}
                    borderRadius="full"
                    bg={category.color || '#4ECDC4'}
                    mr={2}
                  />
                  <Heading size="sm">{category.category}</Heading>
                </Flex>
                
                <SimpleGrid columns={2} spacing={4}>
                  <Stat size="sm">
                    <StatLabel color={textColor}>Time Spent</StatLabel>
                    <StatNumber>{formatTime(category.total_time)}</StatNumber>
                  </Stat>
                  
                  <Stat size="sm">
                    <StatLabel color={textColor}>Tasks</StatLabel>
                    <StatNumber>{category.task_count}</StatNumber>
                  </Stat>
                  
                  <Stat size="sm">
                    <StatLabel color={textColor}>Completion Rate</StatLabel>
                    <StatNumber>{Math.round(category.completion_rate)}%</StatNumber>
                  </Stat>
                </SimpleGrid>
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Box
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="lg"
            bg={bgColor}
            borderColor={borderColor}
            textAlign="center"
          >
            <Text color={textColor}>No category data available for the selected time range</Text>
          </Box>
        )}
      </Box>
      
      {/* Session History */}
      <Box mb={8}>
        <Heading size="md" mb={4}>Session History</Heading>
        
        {sessionHistory.length > 0 ? (
          <Box
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="lg"
            bg={bgColor}
            borderColor={borderColor}
            overflowX="auto"
          >
            <Table variant="simple" size="sm">
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
                {sessionHistory
                  .sort((a, b) => new Date(b.completed_at || b.created_at) - new Date(a.completed_at || a.created_at))
                  .map(session => (
                    <Tr key={session.id}>
                      <Td fontWeight="medium">{session.title}</Td>
                      <Td>{session.goal || 'N/A'}</Td>
                      <Td>
                        <Badge colorScheme="green">
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </Badge>
                      </Td>
                      <Td>{formatDate(session.completed_at || session.created_at)}</Td>
                      <Td>{formatTime(session.actual_duration || session.scheduled_duration || 0)}</Td>
                      <Td>{session.interruption_count || 0}</Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>
          </Box>
        ) : (
          <Box
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="lg"
            bg={bgColor}
            borderColor={borderColor}
            textAlign="center"
          >
            <Text color={textColor}>No session history available</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Statistics;
