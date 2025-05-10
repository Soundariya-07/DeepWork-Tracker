import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
  Badge,
  useColorModeValue,
  Spinner,
  Center,
  Divider,
  List,
  ListItem,
  ListIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { 
  FiClock, 
  FiCalendar, 
  FiPlay, 
  FiPause, 
  FiCheck, 
  FiX, 
  FiAlertCircle,
  FiChevronLeft,
  FiInfo,
  FiTarget,
  FiBarChart2,
  FiAlertTriangle
} from 'react-icons/fi';
import { sessionApi } from '../services/api';

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

const SessionDetail = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [session, setSession] = useState(null);
  const [interruptions, setInterruptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const {
    isOpen: isStartModalOpen,
    onOpen: onStartModalOpen,
    onClose: onStartModalClose
  } = useDisclosure();
  
  // Fetch session data
  useEffect(() => {
    fetchSessionData();
  }, [sessionId]);
  
  // Fetch session data and interruptions
  const fetchSessionData = async () => {
    try {
      setIsLoading(true);
      const sessionData = await sessionApi.getSession(sessionId);
      setSession(sessionData);
      
      // Fetch interruptions
      try {
        const interruptionsData = await sessionApi.getSessionInterruptions(sessionId);
        setInterruptions(interruptionsData);
      } catch (error) {
        console.error('Error fetching interruptions:', error);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch session data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      navigate('/sessions');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle session start
  const handleStartSession = async () => {
    try {
      await sessionApi.startSession(sessionId);
      onStartModalClose();
      navigate(`/active-session/${sessionId}`);
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to start session',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Get status color
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
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Calculate duration in minutes
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    
    return Math.round(durationMs / (1000 * 60));
  };
  
  // Calculate pause time in minutes
  const calculateTotalPauseTime = () => {
    if (interruptions.length === 0) return 0;
    
    // For simplicity, we'll assume each pause is 5 minutes if we don't have resume timestamps
    return interruptions.length * 5;
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return FiClock;
      case 'active': return FiPlay;
      case 'paused': return FiPause;
      case 'completed': return FiCheck;
      case 'interrupted': return FiX;
      case 'abandoned': return FiAlertTriangle;
      case 'overdue': return FiAlertCircle;
      default: return FiClock;
    }
  };
  
  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }
  
  if (!session) {
    return (
      <Box textAlign="center" py={10} px={6}>
        <Icon as={FiAlertCircle} boxSize={'50px'} color={'red.300'} />
        <Heading as="h2" size="xl" mt={6} mb={2}>
          Session Not Found
        </Heading>
        <Text color={'gray.500'}>
          The session you're looking for doesn't exist or has been deleted.
        </Text>
        <Button
          colorScheme="brand"
          mt={6}
          onClick={() => navigate('/sessions')}
          leftIcon={<Icon as={FiChevronLeft} />}
        >
          Go to Sessions
        </Button>
      </Box>
    );
  }
  
  const StatusIcon = getStatusIcon(session.status);
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const actualDuration = calculateDuration(session.start_time, session.end_time);
  const isCompleted = ['completed', 'interrupted', 'abandoned', 'overdue'].includes(session.status);
  const pauseTime = calculateTotalPauseTime();
  
  return (
    <Box>
      <Button
        mb={6}
        leftIcon={<Icon as={FiChevronLeft} />}
        variant="ghost"
        onClick={() => navigate('/sessions')}
      >
        Back to Sessions
      </Button>
      
      <Box
        p={6}
        shadow="md"
        borderWidth="1px"
        borderRadius="lg"
        bg={cardBg}
        borderColor={borderColor}
        mb={6}
      >
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="lg">{session.title}</Heading>
          <Badge 
            colorScheme={getStatusColor(session.status)} 
            fontSize="md" 
            px={3} 
            py={1}
            display="flex"
            alignItems="center"
          >
            <Icon as={StatusIcon} mr={2} />
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </Badge>
        </Flex>
        
        <Text mb={6} color={useColorModeValue('gray.600', 'gray.400')}>
          <Icon as={FiTarget} mr={2} />
          <strong>Goal:</strong> {session.goal || 'No goal specified'}
        </Text>
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={6}>
          <Stat>
            <StatLabel fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
              Scheduled Duration
            </StatLabel>
            <StatNumber fontSize="xl">
              {session.scheduled_duration} min
            </StatNumber>
          </Stat>
          
          <Stat>
            <StatLabel fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
              Actual Duration
            </StatLabel>
            <StatNumber fontSize="xl">
              {actualDuration !== 'N/A' ? `${actualDuration} min` : 'N/A'}
            </StatNumber>
            {actualDuration !== 'N/A' && actualDuration > session.scheduled_duration && (
              <StatHelpText color="red.500">
                {actualDuration - session.scheduled_duration} min over scheduled
              </StatHelpText>
            )}
          </Stat>
          
          <Stat>
            <StatLabel fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
              Interruptions
            </StatLabel>
            <StatNumber fontSize="xl">
              {interruptions.length}
            </StatNumber>
            {pauseTime > 0 && (
              <StatHelpText>
                ~{pauseTime} min total pause time
              </StatHelpText>
            )}
          </Stat>
        </SimpleGrid>
        
        <Divider my={4} />
        
        <VStack align="stretch" spacing={3}>
          <Flex justify="space-between">
            <Text fontWeight="medium">Created:</Text>
            <Text>{formatDate(session.created_at)}</Text>
          </Flex>
          
          <Flex justify="space-between">
            <Text fontWeight="medium">Started:</Text>
            <Text>{formatDate(session.start_time)}</Text>
          </Flex>
          
          <Flex justify="space-between">
            <Text fontWeight="medium">Completed:</Text>
            <Text>{formatDate(session.end_time)}</Text>
          </Flex>
        </VStack>
        
        {session.status === 'scheduled' && (
          <Button
            mt={6}
            colorScheme="green"
            leftIcon={<Icon as={FiPlay} />}
            onClick={onStartModalOpen}
            width="full"
          >
            Start Session
          </Button>
        )}
        
        {(session.status === 'active' || session.status === 'paused') && (
          <Button
            mt={6}
            colorScheme="blue"
            leftIcon={<Icon as={FiPlay} />}
            onClick={() => navigate(`/active-session/${session.id}`)}
            width="full"
          >
            Go to Active Session
          </Button>
        )}
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
          mb={6}
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
                    <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                      {formatDate(interruption.pause_time)}
                    </Text>
                  </Box>
                </Flex>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      
      {/* Session insights */}
      {isCompleted && (
        <Box
          p={6}
          shadow="md"
          borderWidth="1px"
          borderRadius="lg"
          bg={useColorModeValue('blue.50', 'blue.900')}
          borderColor={useColorModeValue('blue.200', 'blue.700')}
        >
          <Heading size="md" mb={4}>
            <Flex align="center">
              <Icon as={FiBarChart2} mr={2} color="blue.500" />
              Session Insights
            </Flex>
          </Heading>
          
          <VStack align="stretch" spacing={4}>
            <Text>
              {session.status === 'completed' ? (
                <>
                  <strong>Great job!</strong> You completed this deep work session 
                  {actualDuration !== 'N/A' && actualDuration > session.scheduled_duration 
                    ? ` and went ${actualDuration - session.scheduled_duration} minutes over your scheduled time.` 
                    : '.'}
                </>
              ) : session.status === 'interrupted' ? (
                <>
                  <strong>This session was interrupted</strong> with {interruptions.length} interruptions. 
                  Consider analyzing what caused these interruptions to improve future sessions.
                </>
              ) : session.status === 'abandoned' ? (
                <>
                  <strong>This session was abandoned</strong> after being paused. 
                  Try to identify what prevented you from resuming this session.
                </>
              ) : (
                <>
                  <strong>This session went overdue</strong>, exceeding your scheduled duration by 
                  {actualDuration !== 'N/A' && actualDuration > session.scheduled_duration 
                    ? ` ${actualDuration - session.scheduled_duration} minutes.` 
                    : '.'}
                  Consider setting more realistic time estimates in the future.
                </>
              )}
            </Text>
            
            {interruptions.length > 0 && (
              <Text>
                <strong>Interruption pattern:</strong> Most of your interruptions were due to 
                {interruptions.length > 0 ? ` "${interruptions[0].reason}"` : ' various reasons'}.
                Try to minimize these distractions in future sessions.
              </Text>
            )}
          </VStack>
        </Box>
      )}
      
      {/* Modals */}
      <ConfirmationModal
        isOpen={isStartModalOpen}
        onClose={onStartModalClose}
        onConfirm={handleStartSession}
        title="Start Session"
        message="Are you ready to start this deep work session? Make sure you have everything you need to focus without interruptions."
        confirmText="Start Session"
        colorScheme="green"
      />
    </Box>
  );
};

export default SessionDetail;
