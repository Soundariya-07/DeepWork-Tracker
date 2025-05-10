import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Button,
  SimpleGrid,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  Text,
  Icon,
  Badge,
  Progress,
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useDisclosure,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  useToast,
} from '@chakra-ui/react';
import { 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiClock, 
  FiPlay, 
  FiPause, 
  FiCheck,
  FiEdit,
  FiTrash2,
  FiMoreVertical,
  FiTag
} from 'react-icons/fi';
import { taskApi } from '../services/api';

// Task card component
const TaskCard = ({ task, onStatusChange, onEdit, onDelete }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Get color based on task status
  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'gray';
      case 'in_progress': return 'blue';
      case 'paused': return 'orange';
      case 'completed': return 'green';
      default: return 'gray';
    }
  };
  
  // Get the next action based on current status
  const getNextAction = (status) => {
    switch (status) {
      case 'todo': return { icon: FiPlay, label: 'Start', status: 'in_progress' };
      case 'in_progress': return { icon: FiPause, label: 'Pause', status: 'paused' };
      case 'paused': return { icon: FiPlay, label: 'Resume', status: 'in_progress' };
      case 'completed': return null;
      default: return null;
    }
  };
  
  const nextAction = getNextAction(task.status);
  
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
    >
      <Flex justify="space-between" align="center" mb={2}>
        <Heading size="md" fontWeight="semibold" isTruncated>
          {task.title}
        </Heading>
        <HStack>
          <Badge colorScheme={getStatusColor(task.status)}>
            {task.status.replace('_', ' ')}
          </Badge>
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FiMoreVertical />}
              variant="ghost"
              size="sm"
              aria-label="Options"
            />
            <MenuList>
              <MenuItem icon={<FiEdit />} onClick={() => onEdit(task)}>
                Edit
              </MenuItem>
              {task.status !== 'completed' && (
                <MenuItem 
                  icon={<FiCheck />} 
                  onClick={() => onStatusChange(task.id, 'completed')}
                >
                  Mark as Completed
                </MenuItem>
              )}
              <MenuItem icon={<FiTrash2 />} onClick={() => onDelete(task.id)}>
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
      
      <Text noOfLines={2} mb={3} color={useColorModeValue('gray.600', 'gray.400')}>
        {task.description || 'No description'}
      </Text>
      
      {task.category && (
        <HStack mb={3}>
          <Icon as={FiTag} color={useColorModeValue('gray.500', 'gray.400')} />
          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
            {task.category}
          </Text>
        </HStack>
      )}
      
      <Box mb={3}>
        <Flex justify="space-between" mb={1}>
          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
            Progress
          </Text>
          <Text fontSize="sm" fontWeight="bold">
            {task.completion_percentage}%
          </Text>
        </Flex>
        <Progress
          value={task.completion_percentage}
          size="sm"
          colorScheme={getStatusColor(task.status)}
          borderRadius="full"
          className="task-progress-bar"
        />
      </Box>
      
      <Flex justify="space-between" align="center">
        <HStack spacing={1}>
          <Icon as={FiClock} color={useColorModeValue('gray.500', 'gray.400')} />
          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
            {task.actual_duration} / {task.scheduled_duration} min
          </Text>
        </HStack>
        
        {nextAction && (
          <Button
            size="sm"
            leftIcon={<Icon as={nextAction.icon} />}
            colorScheme={getStatusColor(nextAction.status)}
            variant="outline"
            onClick={() => onStatusChange(task.id, nextAction.status)}
          >
            {nextAction.label}
          </Button>
        )}
      </Flex>
    </Box>
  );
};

// Task form component
const TaskForm = ({ isOpen, onClose, initialData, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_duration: 25,
    category: '',
    priority: 1,
  });
  
  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        scheduled_duration: initialData.scheduled_duration || 25,
        category: initialData.category || '',
        priority: initialData.priority || 1,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        scheduled_duration: 25,
        category: '',
        priority: 1,
      });
    }
  }, [initialData, isOpen]);
  
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
          <ModalHeader>{initialData ? 'Edit Task' : 'Create New Task'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Task title"
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Task description"
                rows={3}
              />
            </FormControl>
            
            <FormControl mb={4} isRequired>
              <FormLabel>Scheduled Duration (minutes)</FormLabel>
              <NumberInput
                min={1}
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
            
            <FormControl mb={4}>
              <FormLabel>Category</FormLabel>
              <Input
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Work, Study, Personal"
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Priority (1-5)</FormLabel>
              <NumberInput
                min={1}
                max={5}
                value={formData.priority}
                onChange={(_, value) => handleNumberChange('priority', value)}
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
              {initialData ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

// Interruption form component
const InterruptionForm = ({ isOpen, onClose, taskId, onSubmit }) => {
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
    onSubmit(taskId, reason);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Pause Task</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Reason for interruption</FormLabel>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why are you pausing this task?"
                rows={3}
              />
            </FormControl>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="orange" type="submit">
              Pause Task
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [interruptingTaskId, setInterruptingTaskId] = useState(null);
  
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isInterruptionOpen, onOpen: onInterruptionOpen, onClose: onInterruptionClose } = useDisclosure();
  
  const toast = useToast();
  
  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);
  
  // Apply filters when tasks, searchTerm, statusFilter, or categoryFilter changes
  useEffect(() => {
    applyFilters();
  }, [tasks, searchTerm, statusFilter, categoryFilter]);
  
  // Extract unique categories from tasks
  useEffect(() => {
    const uniqueCategories = [...new Set(tasks.map(task => task.category).filter(Boolean))];
    setCategories(uniqueCategories);
  }, [tasks]);
  
  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const tasksData = await taskApi.getTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tasks',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Apply filters to tasks
  const applyFilters = () => {
    let filtered = [...tasks];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        task => 
          task.title.toLowerCase().includes(term) || 
          (task.description && task.description.toLowerCase().includes(term))
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
    
    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(task => task.category === categoryFilter);
    }
    
    setFilteredTasks(filtered);
  };
  
  // Handle task creation/update
  const handleTaskSubmit = async (formData) => {
    try {
      if (editingTask) {
        // Update existing task
        await taskApi.updateTask(editingTask.id, formData);
        toast({
          title: 'Task updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new task
        await taskApi.createTask(formData);
        toast({
          title: 'Task created',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Refresh tasks and close form
      fetchTasks();
      onFormClose();
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: 'Error',
        description: 'Failed to save task',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Handle task status change
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // If changing to paused, open interruption form
      if (newStatus === 'paused') {
        setInterruptingTaskId(taskId);
        onInterruptionOpen();
        return;
      }
      
      // Otherwise, update status directly
      await taskApi.updateTaskStatus(taskId, newStatus);
      fetchTasks();
      
      toast({
        title: 'Status updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Handle interruption submission
  const handleInterruptionSubmit = async (taskId, reason) => {
    try {
      await taskApi.createInterruption(taskId, { reason });
      fetchTasks();
      onInterruptionClose();
      
      toast({
        title: 'Task paused',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error creating interruption:', error);
      toast({
        title: 'Error',
        description: 'Failed to pause task',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskApi.deleteTask(taskId);
        fetchTasks();
        
        toast({
          title: 'Task deleted',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error deleting task:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete task',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };
  
  // Handle task edit
  const handleEditTask = (task) => {
    setEditingTask(task);
    onFormOpen();
  };
  
  // Handle creating a new task
  const handleNewTask = () => {
    setEditingTask(null);
    onFormOpen();
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCategoryFilter('');
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Tasks</Heading>
        <Button
          colorScheme="brand"
          leftIcon={<Icon as={FiPlus} />}
          onClick={handleNewTask}
        >
          New Task
        </Button>
      </Flex>
      
      {/* Filters */}
      <Box
        p={4}
        bg={useColorModeValue('white', 'gray.800')}
        borderRadius="lg"
        shadow="md"
        mb={6}
      >
        <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
          <InputGroup flex={1}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          
          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            maxW={{ base: '100%', md: '200px' }}
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </Select>
          
          <Select
            placeholder="Filter by category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            maxW={{ base: '100%', md: '200px' }}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
          
          <Button
            leftIcon={<Icon as={FiFilter} />}
            onClick={clearFilters}
            variant="outline"
          >
            Clear
          </Button>
        </Flex>
      </Box>
      
      {/* Task List */}
      {filteredTasks.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Box
          p={8}
          textAlign="center"
          borderRadius="lg"
          bg={useColorModeValue('white', 'gray.800')}
          shadow="md"
        >
          <Text mb={4} fontSize="lg">
            {isLoading
              ? 'Loading tasks...'
              : tasks.length === 0
              ? 'No tasks found. Create your first task!'
              : 'No tasks match your filters.'}
          </Text>
          {!isLoading && tasks.length === 0 && (
            <Button
              colorScheme="brand"
              leftIcon={<Icon as={FiPlus} />}
              onClick={handleNewTask}
            >
              Create Task
            </Button>
          )}
          {!isLoading && tasks.length > 0 && (
            <Button
              variant="outline"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          )}
        </Box>
      )}
      
      {/* Task Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={onFormClose}
        initialData={editingTask}
        onSubmit={handleTaskSubmit}
      />
      
      {/* Interruption Form Modal */}
      <InterruptionForm
        isOpen={isInterruptionOpen}
        onClose={onInterruptionClose}
        taskId={interruptingTaskId}
        onSubmit={handleInterruptionSubmit}
      />
    </Box>
  );
};

export default TaskList;
