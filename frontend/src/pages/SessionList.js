import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Button,
  SimpleGrid,
  useColorModeValue,
  Text,
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
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useDisclosure,
  useToast,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { FiPlus, FiClock, FiPlay, FiPause, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { sessionApi } from '../services/api';

// Session form component
const SessionForm = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    goal: '',
    scheduled_duration: 25,
  });
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        goal: '',
        scheduled_duration: 25,
      });
    }
  }, [isOpen]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle number input changes
  const handleNumberChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Schedule New Session</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Session title"
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Goal</FormLabel>
              <Textarea
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                placeholder="What do you want to accomplish?"
                rows={3}
              />
            </FormControl>
            
            <FormControl mb={4} isRequired>
              <FormLabel>Duration (minutes)</FormLabel>
              <NumberInput
                min={5}
                max={240}
                value={formData.scheduled_duration}
                onChange={(_, value) => handleNumberChange('scheduled_duration', value)}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit">
              Schedule Session
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

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
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not started';
    const date = new Date(dateString);
    return date.toLocaleString();
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
        <Flex align="center">
          <Icon as={FiClock} mr={2} color={useColorModeValue('gray.500', 'gray.400')} />
          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
            {session.scheduled_duration} min
          </Text>
        </Flex>
        
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

const SessionList = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  
  // Fetch sessions on component mount
  useEffect(() => {
    fetchSessions();
  }, []);
  
  // Fetch sessions from API
  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const data = await sessionApi.getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch sessions',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle session creation
  const handleCreateSession = async (formData) => {
    try {
      const newSession = await sessionApi.createSession(formData);
      setSessions([newSession, ...sessions]);
      onClose();
      
      toast({
        title: 'Session scheduled',
        description: 'Your deep work session has been scheduled',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule session',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Handle session start
  const handleStartSession = async (sessionId) => {
    try {
      await sessionApi.startSession(sessionId);
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
  
  // Filter sessions by status
  const scheduledSessions = sessions.filter(s => s.status === 'scheduled');
  const activeSessions = sessions.filter(s => s.status === 'active' || s.status === 'paused');
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Deep Work Sessions</Heading>
        <Button
          colorScheme="brand"
          leftIcon={<Icon as={FiPlus} />}
          onClick={onOpen}
        >
          Schedule Session
        </Button>
      </Flex>
      
      {isLoading ? (
        <Center py={10}>
          <Spinner size="xl" color="brand.500" />
        </Center>
      ) : (
        <>
          {/* Active Sessions */}
          {activeSessions.length > 0 && (
            <Box mb={8}>
              <Heading size="md" mb={4}>
                <Flex align="center">
                  <Icon as={FiPlay} mr={2} color="green.500" />
                  Active Sessions
                </Flex>
              </Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                {activeSessions.map(session => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onStart={handleStartSession}
                  />
                ))}
              </SimpleGrid>
            </Box>
          )}
          
          {/* Scheduled Sessions */}
          <Box mb={8}>
            <Heading size="md" mb={4}>
              <Flex align="center">
                <Icon as={FiClock} mr={2} color="blue.500" />
                Scheduled Sessions
              </Flex>
            </Heading>
            
            {scheduledSessions.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                {scheduledSessions.map(session => (
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
                  colorScheme="brand"
                  leftIcon={<Icon as={FiPlus} />}
                  onClick={onOpen}
                >
                  Schedule Your First Session
                </Button>
              </Box>
            )}
          </Box>
          
          {/* Link to History */}
          <Flex justify="center" mt={8}>
            <Button
              as={RouterLink}
              to="/history"
              variant="outline"
              rightIcon={<Icon as={FiClock} />}
            >
              View Session History
            </Button>
          </Flex>
        </>
      )}
      
      {/* Session Form Modal */}
      <SessionForm
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleCreateSession}
      />
    </Box>
  );
};

export default SessionList;
