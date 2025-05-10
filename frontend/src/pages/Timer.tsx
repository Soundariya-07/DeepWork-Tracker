import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  VStack,
  Text,
  Input,
  FormControl,
  FormLabel,
  useToast,
  HStack,
  Progress,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiPlay, FiPause, FiStop, FiClock, FiAlertCircle } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';

interface SessionState {
  title: string;
  goal: string;
  duration: number;
  timeLeft: number;
  isActive: boolean;
  isPaused: boolean;
  interruptions: number;
}

const Timer: React.FC = () => {
  const [session, setSession] = useState<SessionState>({
    title: '',
    goal: '',
    duration: 25,
    timeLeft: 25 * 60,
    isActive: false,
    isPaused: false,
    interruptions: 0,
  });

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startSession = () => {
    if (!session.title || !session.goal) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both title and goal for the session',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setSession(prev => ({
      ...prev,
      timeLeft: prev.duration * 60,
      isActive: true,
      isPaused: false,
    }));
  };

  const pauseSession = () => {
    setSession(prev => ({
      ...prev,
      isPaused: true,
      interruptions: prev.interruptions + 1,
    }));
    toast({
      title: 'Session Paused',
      description: `Interruption #${session.interruptions + 1}`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const resumeSession = () => {
    setSession(prev => ({ ...prev, isPaused: false }));
  };

  const stopSession = () => {
    const completedSession = {
      title: session.title,
      goal: session.goal,
      duration: session.duration,
      interruptions: session.interruptions,
      completed_at: new Date().toISOString(),
    };
    
    // Here you would typically save the session to your backend
    console.log('Session completed:', completedSession);
    
    setSession({
      title: '',
      goal: '',
      duration: 25,
      timeLeft: 25 * 60,
      isActive: false,
      isPaused: false,
      interruptions: 0,
    });

    toast({
      title: 'Session Completed',
      description: 'Great job! Your deep work session has been saved.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const handleTick = useCallback(() => {
    setSession(prev => {
      if (!prev.isActive || prev.isPaused || prev.timeLeft <= 0) return prev;
      
      if (prev.timeLeft === 1) {
        toast({
          title: 'Session Complete!',
          description: 'Time to take a break.',
          status: 'success',
          duration: null,
          isClosable: true,
        });
      }
      
      return {
        ...prev,
        timeLeft: prev.timeLeft - 1,
      };
    });
  }, [toast]);

  useEffect(() => {
    const timer = setInterval(handleTick, 1000);
    return () => clearInterval(timer);
  }, [handleTick]);

  const progress = (session.timeLeft / (session.duration * 60)) * 100;

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8}>
        <HStack w="100%" justify="space-between">
          <Heading size="lg">DeepWork Timer</Heading>
          <Button
            as={RouterLink}
            to="/history"
            variant="ghost"
            leftIcon={<FiClock />}
          >
            Session History
          </Button>
        </HStack>

        <Box
          w="100%"
          p={6}
          borderRadius="lg"
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
        >
          <VStack spacing={4}>
            <FormControl isDisabled={session.isActive}>
              <FormLabel>Session Title</FormLabel>
              <Input
                value={session.title}
                onChange={e => setSession(prev => ({ ...prev, title: e.target.value }))}
                placeholder="What are you working on?"
              />
            </FormControl>

            <FormControl isDisabled={session.isActive}>
              <FormLabel>Session Goal</FormLabel>
              <Input
                value={session.goal}
                onChange={e => setSession(prev => ({ ...prev, goal: e.target.value }))}
                placeholder="What do you want to accomplish?"
              />
            </FormControl>

            <FormControl isDisabled={session.isActive}>
              <FormLabel>Duration (minutes)</FormLabel>
              <Input
                type="number"
                value={session.duration}
                onChange={e => setSession(prev => ({
                  ...prev,
                  duration: parseInt(e.target.value),
                  timeLeft: parseInt(e.target.value) * 60,
                }))}
                min={1}
                max={120}
              />
            </FormControl>

            <Box w="100%" pt={4}>
              <Progress
                value={progress}
                size="lg"
                colorScheme={progress < 20 ? 'red' : progress < 50 ? 'yellow' : 'green'}
                borderRadius="full"
                mb={4}
              />
              <Text fontSize="6xl" textAlign="center" fontWeight="bold">
                {formatTime(session.timeLeft)}
              </Text>
              {session.interruptions > 0 && (
                <HStack justify="center" color="orange.500" mt={2}>
                  <FiAlertCircle />
                  <Text>Interruptions: {session.interruptions}</Text>
                </HStack>
              )}
            </Box>

            <HStack spacing={4}>
              {!session.isActive ? (
                <Button
                  leftIcon={<FiPlay />}
                  colorScheme="green"
                  onClick={startSession}
                  size="lg"
                >
                  Start Session
                </Button>
              ) : (
                <>
                  {session.isPaused ? (
                    <IconButton
                      aria-label="Resume session"
                      icon={<FiPlay />}
                      colorScheme="green"
                      onClick={resumeSession}
                      size="lg"
                    />
                  ) : (
                    <IconButton
                      aria-label="Pause session"
                      icon={<FiPause />}
                      colorScheme="yellow"
                      onClick={pauseSession}
                      size="lg"
                    />
                  )}
                  <IconButton
                    aria-label="Stop session"
                    icon={<FiStop />}
                    colorScheme="red"
                    onClick={stopSession}
                    size="lg"
                  />
                </>
              )}
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default Timer;
