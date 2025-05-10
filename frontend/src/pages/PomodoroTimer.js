import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  HStack,
  IconButton,
  useColorModeValue,
  Flex,
  Select,
  Progress,
  useToast,
  Badge,
  Divider,
  SimpleGrid,
  Center,
} from '@chakra-ui/react';
import { FiPlay, FiPause, FiSkipForward, FiSettings, FiRefreshCw } from 'react-icons/fi';
import { taskApi } from '../services/api';

const PomodoroTimer = () => {
  // Timer states
  const [timerMode, setTimerMode] = useState('pomodoro'); // pomodoro, shortBreak, longBreak
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  
  // Timer settings
  const timerSettings = {
    pomodoro: 25 * 60, // 25 minutes
    shortBreak: 5 * 60, // 5 minutes
    longBreak: 15 * 60, // 15 minutes
  };
  
  // References
  const intervalRef = useRef(null);
  const toast = useToast();
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const timerColors = {
    pomodoro: 'red.500',
    shortBreak: 'green.500',
    longBreak: 'blue.500',
  };
  
  // Fetch tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksData = await taskApi.getTasks({ status: 'in_progress' });
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    
    fetchTasks();
  }, []);
  
  // Timer logic
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current);
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    
    return () => clearInterval(intervalRef.current);
  }, [isActive]);
  
  // Handle timer completion
  const handleTimerComplete = () => {
    const nextMode = getNextTimerMode();
    
    // Play sound
    const audio = new Audio('/notification.mp3');
    audio.play();
    
    // Show notification
    toast({
      title: `${formatTimerMode(timerMode)} completed!`,
      description: `Time to ${timerMode === 'pomodoro' ? 'take a break' : 'focus'}!`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    
    // Update pomodoro count if completed a pomodoro session
    if (timerMode === 'pomodoro') {
      setPomodoroCount((prev) => prev + 1);
      
      // Update task time if a task is selected
      if (selectedTask) {
        updateTaskTime(selectedTask.id, timerSettings.pomodoro / 60);
      }
    }
    
    // Switch to next timer mode
    switchTimerMode(nextMode);
  };
  
  // Get next timer mode
  const getNextTimerMode = () => {
    if (timerMode === 'pomodoro') {
      // After every 4 pomodoros, take a long break
      return (pomodoroCount + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
    } else {
      return 'pomodoro';
    }
  };
  
  // Switch timer mode
  const switchTimerMode = (mode) => {
    setTimerMode(mode);
    setTimeLeft(timerSettings[mode]);
    setIsActive(false);
  };
  
  // Update task time
  const updateTaskTime = async (taskId, minutes) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        await taskApi.updateTask(taskId, {
          actual_duration: task.actual_duration + minutes
        });
      }
    } catch (error) {
      console.error('Error updating task time:', error);
    }
  };
  
  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format timer mode for display
  const formatTimerMode = (mode) => {
    switch (mode) {
      case 'pomodoro': return 'Focus Session';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Break';
      default: return mode;
    }
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    const total = timerSettings[timerMode];
    return ((total - timeLeft) / total) * 100;
  };
  
  // Handle task selection
  const handleTaskSelect = (e) => {
    const taskId = parseInt(e.target.value);
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      setSelectedTask(task);
    } else {
      setSelectedTask(null);
    }
  };
  
  // Timer controls
  const startTimer = () => setIsActive(true);
  const pauseTimer = () => setIsActive(false);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(timerSettings[timerMode]);
  };
  const skipTimer = () => handleTimerComplete();
  
  // Calculate circle dimensions for timer
  const size = 280;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (calculateProgress() / 100) * circumference;
  
  return (
    <Box>
      <VStack spacing={8} align="center">
        <Heading size="lg">Pomodoro Timer</Heading>
        
        {/* Timer Mode Selector */}
        <HStack spacing={4}>
          {['pomodoro', 'shortBreak', 'longBreak'].map((mode) => (
            <Button
              key={mode}
              onClick={() => switchTimerMode(mode)}
              colorScheme={timerMode === mode ? mode === 'pomodoro' ? 'red' : mode === 'shortBreak' ? 'green' : 'blue' : 'gray'}
              variant={timerMode === mode ? 'solid' : 'outline'}
              size="md"
            >
              {formatTimerMode(mode)}
            </Button>
          ))}
        </HStack>
        
        {/* Timer Display */}
        <Box position="relative" width={`${size}px`} height={`${size}px`}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={useColorModeValue('gray.100', 'gray.700')}
              strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={timerColors[timerMode]}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="timer-circle"
            />
          </svg>
          
          {/* Time display in the center */}
          <Center
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            flexDirection="column"
          >
            <Text fontSize="5xl" fontWeight="bold">
              {formatTime(timeLeft)}
            </Text>
            <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>
              {formatTimerMode(timerMode)}
            </Text>
            {selectedTask && (
              <Badge colorScheme="blue" mt={2}>
                {selectedTask.title}
              </Badge>
            )}
          </Center>
        </Box>
        
        {/* Timer Controls */}
        <HStack spacing={4}>
          {!isActive ? (
            <IconButton
              icon={<FiPlay />}
              onClick={startTimer}
              colorScheme="green"
              size="lg"
              isRound
              aria-label="Start Timer"
            />
          ) : (
            <IconButton
              icon={<FiPause />}
              onClick={pauseTimer}
              colorScheme="yellow"
              size="lg"
              isRound
              aria-label="Pause Timer"
            />
          )}
          <IconButton
            icon={<FiRefreshCw />}
            onClick={resetTimer}
            colorScheme="blue"
            size="lg"
            isRound
            aria-label="Reset Timer"
          />
          <IconButton
            icon={<FiSkipForward />}
            onClick={skipTimer}
            colorScheme="purple"
            size="lg"
            isRound
            aria-label="Skip Timer"
          />
        </HStack>
        
        {/* Task Selection */}
        <Box
          p={5}
          shadow="md"
          borderWidth="1px"
          borderRadius="lg"
          bg={bgColor}
          borderColor={borderColor}
          width="100%"
          maxW="500px"
        >
          <VStack spacing={4} align="stretch">
            <Heading size="md">Select Task</Heading>
            <Select
              placeholder="Select a task to track"
              onChange={handleTaskSelect}
              value={selectedTask?.id || ''}
            >
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </Select>
            
            {selectedTask && (
              <>
                <Divider />
                <Box>
                  <Text fontWeight="semibold">Task Progress</Text>
                  <Flex justify="space-between" mt={1}>
                    <Text fontSize="sm">
                      {selectedTask.actual_duration} / {selectedTask.scheduled_duration} minutes
                    </Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {selectedTask.completion_percentage}%
                    </Text>
                  </Flex>
                  <Progress
                    value={selectedTask.completion_percentage}
                    size="sm"
                    colorScheme="blue"
                    borderRadius="full"
                    mt={1}
                  />
                </Box>
              </>
            )}
          </VStack>
        </Box>
        
        {/* Session Stats */}
        <Box
          p={5}
          shadow="md"
          borderWidth="1px"
          borderRadius="lg"
          bg={bgColor}
          borderColor={borderColor}
          width="100%"
          maxW="500px"
        >
          <VStack spacing={4} align="stretch">
            <Heading size="md">Session Stats</Heading>
            <SimpleGrid columns={2} spacing={4}>
              <Box>
                <Text color={useColorModeValue('gray.600', 'gray.400')}>
                  Completed Pomodoros
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {pomodoroCount}
                </Text>
              </Box>
              <Box>
                <Text color={useColorModeValue('gray.600', 'gray.400')}>
                  Total Focus Time
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {Math.floor((pomodoroCount * timerSettings.pomodoro) / 60)}m
                </Text>
              </Box>
            </SimpleGrid>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default PomodoroTimer;
