import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Progress,
  VStack,
  HStack,
  Icon,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  useDisclosure,
  useToast,
  useColorModeValue,
  Spinner,
  Center,
  Divider,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { 
  FiPlay, 
  FiPause, 
  FiCheck, 
  FiClock, 
  FiAlertTriangle, 
  FiX, 
  FiAlertCircle,
  FiChevronLeft,
  FiInfo
} from 'react-icons/fi';
import { sessionApi } from '../services/api';

// Interruption form component
const InterruptionForm = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setReason('');
    }
  }, [isOpen]);
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(reason);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Pause Session</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              What caused the interruption? This will help you track patterns that disrupt your deep work.
            </Text>
            <FormControl isRequired>
              <FormLabel>Reason for interruption</FormLabel>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="E.g., Phone call, colleague question, social media distraction..."
                rows={4}
              />
            </FormControl>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="orange" type="submit">
              Pause Session
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

// Confirmation modal component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, colorScheme }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>{message}</Text>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme={colorScheme} onClick={onConfirm}>
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const ActiveSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Define all color mode values at the top level
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  
  const [session, setSession] = useState(null);
  const [interruptions, setInterruptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  
  const timerRef = useRef(null);
  
  // Modal states
  const {
    isOpen: isPauseModalOpen,
    onOpen: onPauseModalOpen,
    onClose: onPauseModalClose
  } = useDisclosure();
  
  const {
    isOpen: isCompleteModalOpen,
    onOpen: onCompleteModalOpen,
    onClose: onCompleteModalClose
  } = useDisclosure();
  
  // Fetch session data
  useEffect(() => {
    if (sessionId) {
      fetchSessionData();
    } else {
      setIsLoading(false);
    }
    
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionId]);
  
  const fetchSessionData = async () => {
    try {
      setIsLoading(true);
      const sessionData = await sessionApi.getSession(sessionId);
      setSession(sessionData);
      
      // Set elapsed time if session is active
      if (sessionData.status === 'active' && sessionData.start_time) {
        const startTime = new Date(sessionData.start_time).getTime();
        const now = new Date().getTime();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsedSeconds);
        startTimer();
      }
      
      // Fetch interruptions
      const interruptionsData = await sessionApi.getSessionInterruptions(sessionId);
      setInterruptions(interruptionsData);
    } catch (error) {
      console.error('Error fetching session:', error);
      toast({
        title: 'Error',
        description: 'Failed to load session data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Start timer
  const startTimer = () => {
    if (!timerRunning) {
      setTimerRunning(true);
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
  };
  
  // Stop timer
  const stopTimer = () => {
    if (timerRunning) {
      setTimerRunning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    if (!session || !session.scheduled_duration) return 0;
    const progressPercent = (elapsedTime / (session.scheduled_duration * 60)) * 100;
    return Math.min(progressPercent, 100);
  };
  
  // Handle session start
  const handleStartSession = async () => {
    try {
      await sessionApi.startSession(sessionId);
      
      toast({
        title: 'Session Started',
        description: 'Your deep work session has begun',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Update session data and start timer
      setElapsedTime(0);
      startTimer();
      fetchSessionData();
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: 'Error',
        description: 'Failed to start session',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle session pause
  const handlePauseSession = async (reason) => {
    try {
      await sessionApi.pauseSession(sessionId, { reason });
      
      toast({
        title: 'Session Paused',
        description: 'Your deep work session has been paused',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      
      // Stop timer and update data
      stopTimer();
      onPauseModalClose();
      fetchSessionData();
    } catch (error) {
      console.error('Error pausing session:', error);
      toast({
        title: 'Error',
        description: 'Failed to pause session',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle session resume
  const handleResumeSession = async () => {
    try {
      await sessionApi.resumeSession(sessionId);
      
      toast({
        title: 'Session Resumed',
        description: 'Your deep work session has been resumed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Start timer and update data
      startTimer();
      fetchSessionData();
    } catch (error) {
      console.error('Error resuming session:', error);
      toast({
        title: 'Error',
        description: 'Failed to resume session',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle session complete
  const handleCompleteSession = async () => {
    try {
      await sessionApi.completeSession(sessionId);
      
      toast({
        title: 'Session Completed',
        description: 'Your deep work session has been completed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Stop timer and redirect to session detail
      stopTimer();
      onCompleteModalClose();
      navigate(`/sessions/${sessionId}/detail`);
    } catch (error) {
      console.error('Error completing session:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete session',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'gray';
      case 'active':
        return 'green';
      case 'paused':
        return 'orange';
      case 'completed':
        return 'blue';
      default:
        return 'gray';
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not started';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }
  
  if (!session) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Icon as={FiAlertCircle} boxSize={12} color="red.500" />
          <Heading size="md">Session Not Found</Heading>
          <Button
            leftIcon={<Icon as={FiChevronLeft} />}
            onClick={() => navigate('/sessions')}
          >
            Back to Sessions
          </Button>
        </VStack>
      </Center>
    );
  }
  
  return (
    <Box p={4}>
      <Button
        leftIcon={<Icon as={FiChevronLeft} />}
        variant="ghost"
        mb={4}
        onClick={() => navigate('/sessions')}
      >
        Back to Sessions
      </Button>
      
      <VStack spacing={6} align="stretch">
        {/* Session header */}
        <Box
          p={6}
          shadow="md"
          borderWidth="1px"
          borderRadius="lg"
          bg={cardBg}
          borderColor={borderColor}
        >
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Heading size="lg">{session.title}</Heading>
              <Badge
                colorScheme={getStatusColor(session.status)}
                fontSize="md"
                px={3}
                py={1}
                borderRadius="full"
              >
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </Badge>
            </Flex>
            
            <Text color={textColor}>{session.description}</Text>
            
            {/* Timer display for active sessions */}
            {(session.status === 'active' || session.status === 'paused') && (
              <Box mt={4}>
                <Flex justify="space-between" align="center" mb={2}>
                  <Heading size="xl" fontFamily="mono">
                    <Icon as={FiClock} mr={2} />
                    {formatTime(elapsedTime)}
                  </Heading>
                  <Text>
                    {Math.floor(elapsedTime / 60)} / {session.scheduled_duration} minutes
                  </Text>
                </Flex>
                <Progress
                  value={calculateProgress()}
                  size="lg"
                  colorScheme={session.status === 'active' ? 'green' : 'orange'}
                  borderRadius="full"
                  hasStripe={session.status === 'active'}
                  isAnimated={session.status === 'active'}
                />
              </Box>
            )}
            
            {/* Session controls */}
            <HStack spacing={4} justify="center" mt={4}>
              {session.status === 'scheduled' && (
                <Button
                  colorScheme="green"
                  size="lg"
                  leftIcon={<Icon as={FiPlay} />}
                  onClick={handleStartSession}
                >
                  Start Session
                </Button>
              )}
              
              {session.status === 'active' && (
                <>
                  <Button
                    colorScheme="orange"
                    size="lg"
                    leftIcon={<Icon as={FiPause} />}
                    onClick={onPauseModalOpen}
                  >
                    Pause
                  </Button>
                  <Button
                    colorScheme="blue"
                    size="lg"
                    leftIcon={<Icon as={FiCheck} />}
                    onClick={onCompleteModalOpen}
                  >
                    Complete
                  </Button>
                </>
              )}
              
              {session.status === 'paused' && (
                <>
                  <Button
                    colorScheme="green"
                    size="lg"
                    leftIcon={<Icon as={FiPlay} />}
                    onClick={handleResumeSession}
                  >
                    Resume
                  </Button>
                  <Button
                    colorScheme="blue"
                    size="lg"
                    leftIcon={<Icon as={FiCheck} />}
                    onClick={onCompleteModalOpen}
                  >
                    Complete
                  </Button>
                </>
              )}
            </HStack>
            
            {/* Session info */}
            <Divider my={4} />
            
            <VStack align="stretch" spacing={2}>
              <Flex justify="space-between">
                <Text fontWeight="medium">Scheduled Duration:</Text>
                <Text>{session.scheduled_duration} minutes</Text>
              </Flex>
              
              <Flex justify="space-between">
                <Text fontWeight="medium">Start Time:</Text>
                <Text>{formatDate(session.start_time)}</Text>
              </Flex>
              
              <Flex justify="space-between">
                <Text fontWeight="medium">Interruptions:</Text>
                <Text>{interruptions.length}</Text>
              </Flex>
            </VStack>
          </VStack>
        </Box>
        
        {/* Interruptions list */}
        {interruptions.length > 0 && (
          <Box
            p={6}
            shadow="md"
            borderWidth="1px"
            borderRadius="lg"
            bg={cardBg}
            borderColor={borderColor}
          >
            <Heading size="md" mb={4}>
              <Flex align="center">
                <Icon as={FiInfo} mr={2} color="orange.500" />
                Interruptions
              </Flex>
            </Heading>
            
            <List spacing={3}>
              {interruptions.map((interruption) => (
                <ListItem key={interruption.id}>
                  <Flex align="start">
                    <ListIcon as={FiX} color="red.500" mt={1} />
                    <Box>
                      <Text fontWeight="medium">{interruption.reason}</Text>
                      <Text fontSize="sm" color={textColor}>
                        {formatDate(interruption.pause_time)}
                      </Text>
                    </Box>
                  </Flex>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        
        {/* Modals */}
        <InterruptionForm
          isOpen={isPauseModalOpen}
          onClose={onPauseModalClose}
          onSubmit={handlePauseSession}
        />
        
        <ConfirmationModal
          isOpen={isCompleteModalOpen}
          onClose={onCompleteModalClose}
          onConfirm={handleCompleteSession}
          title="Complete Session"
          message="Are you sure you want to complete this deep work session? This will mark the session as completed and stop the timer."
          confirmText="Complete Session"
          colorScheme="blue"
        />
      </VStack>
    </Box>
  );
};

const ActiveSessionPage = () => {
  const [activeSessions, setActiveSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActiveSessions = async () => {
      try {
        const response = await axios.get('http://localhost:8090/sessions');
        const activeOnes = response.data.filter(session => session.status === 'active' || session.status === 'paused');
        setActiveSessions(activeOnes);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching active sessions:', error);
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

    fetchActiveSessions();
    // Refresh active sessions every minute
    const interval = setInterval(fetchActiveSessions, 60000);
    return () => clearInterval(interval);
  }, [toast]);

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  return (
    <Box p={5}>
      <Button
        leftIcon={<FiChevronLeft />}
        variant="ghost"
        mb={6}
        onClick={() => navigate('/')}
      >
        Back to Dashboard
      </Button>

      <Heading mb={6}>Active Sessions</Heading>

      {activeSessions.length === 0 ? (
        <Box p={5} borderWidth="1px" borderRadius="lg" textAlign="center">
          <Icon as={FiInfo} boxSize={6} color="gray.500" mb={3} />
          <Text>No active sessions found.</Text>
          <Button
            mt={4}
            colorScheme="blue"
            onClick={() => navigate('/')}
          >
            Start a New Session
          </Button>
        </Box>
      ) : (
        <VStack spacing={4} align="stretch">
          {activeSessions.map((session) => (
            <Box
              key={session.id}
              p={5}
              borderWidth="1px"
              borderRadius="lg"
              borderColor={session.status === 'active' ? 'green.200' : 'orange.200'}
              bg={useColorModeValue('white', 'gray.800')}
              shadow="sm"
            >
              <Flex justify="space-between" align="center" mb={3}>
                <Heading size="md">{session.title}</Heading>
                <Badge
                  colorScheme={session.status === 'active' ? 'green' : 'orange'}
                >
                  {session.status.toUpperCase()}
                </Badge>
              </Flex>
              
              <Text color="gray.600" mb={3}>
                Goal: {session.goal || 'No goal set'}
              </Text>

              <HStack spacing={4}>
                <Button
                  leftIcon={session.status === 'active' ? <FiPause /> : <FiPlay />}
                  colorScheme={session.status === 'active' ? 'orange' : 'green'}
                  onClick={() => {
                    // Handle resume/pause
                    const newStatus = session.status === 'active' ? 'paused' : 'active';
                    axios.put(`http://localhost:8090/sessions/${session.id}`, {
                      ...session,
                      status: newStatus
                    })
                    .then(() => {
                      setActiveSessions(prev => 
                        prev.map(s => s.id === session.id ? {...s, status: newStatus} : s)
                      );
                    })
                    .catch(error => {
                      toast({
                        title: 'Error updating session',
                        description: error.message,
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                      });
                    });
                  }}
                >
                  {session.status === 'active' ? 'Pause' : 'Resume'}
                </Button>
                
                <Button
                  leftIcon={<FiCheck />}
                  colorScheme="blue"
                  onClick={() => {
                    // Complete session
                    axios.put(`http://localhost:8090/sessions/${session.id}`, {
                      ...session,
                      status: 'completed',
                      completed_at: new Date().toISOString()
                    })
                    .then(() => {
                      setActiveSessions(prev => prev.filter(s => s.id !== session.id));
                      toast({
                        title: 'Session completed',
                        description: 'Great job on completing your deep work session!',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                      });
                    })
                    .catch(error => {
                      toast({
                        title: 'Error completing session',
                        description: error.message,
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                      });
                    });
                  }}
                >
                  Complete
                </Button>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default ActiveSessionPage;
