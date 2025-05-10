import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Button,
  VStack,
  HStack,
  Text,
  useColorMode,
  useColorModeValue,
  Select,
  Divider,
  useToast,
  Icon,
  Flex,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { FiSave, FiMoon, FiSun, FiVolume2, FiClock, FiBell } from 'react-icons/fi';

const Settings = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  
  // Settings state
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    soundEnabled: true,
    defaultSessionDuration: 25,
    defaultBreakDuration: 5,
    autoStartBreaks: false,
    theme: colorMode,
    notificationSound: 'bell',
  });
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('deepwork-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
        
        // Apply theme from settings
        if (parsedSettings.theme !== colorMode) {
          toggleColorMode();
        }
      } catch (error) {
        console.error('Error parsing settings:', error);
      }
    }
  }, []);
  
  // Handle settings change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle number input change
  const handleNumberChange = (name, value) => {
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle theme toggle
  const handleThemeToggle = () => {
    toggleColorMode();
    setSettings(prev => ({
      ...prev,
      theme: colorMode === 'light' ? 'dark' : 'light'
    }));
  };
  
  // Save settings
  const saveSettings = () => {
    localStorage.setItem('deepwork-settings', JSON.stringify(settings));
    
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been saved.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Reset settings to defaults
  const resetSettings = () => {
    const defaultSettings = {
      notificationsEnabled: true,
      soundEnabled: true,
      defaultSessionDuration: 25,
      defaultBreakDuration: 5,
      autoStartBreaks: false,
      theme: 'light',
      notificationSound: 'bell',
    };
    
    setSettings(defaultSettings);
    localStorage.setItem('deepwork-settings', JSON.stringify(defaultSettings));
    
    // Apply default theme
    if (defaultSettings.theme !== colorMode) {
      toggleColorMode();
    }
    
    toast({
      title: 'Settings reset',
      description: 'Your settings have been reset to defaults.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box>
      <Heading size="lg" mb={6}>Settings</Heading>
      
      <Box
        p={6}
        shadow="md"
        borderWidth="1px"
        borderRadius="lg"
        bg={cardBg}
        borderColor={borderColor}
        mb={6}
      >
        <VStack spacing={6} align="stretch">
          {/* Appearance */}
          <Box>
            <Heading size="md" mb={4}>Appearance</Heading>
            
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="theme-toggle" mb="0">
                <HStack spacing={2}>
                  <Icon as={colorMode === 'light' ? FiSun : FiMoon} />
                  <Text>Dark Mode</Text>
                </HStack>
              </FormLabel>
              <Switch
                id="theme-toggle"
                isChecked={colorMode === 'dark'}
                onChange={handleThemeToggle}
              />
            </FormControl>
          </Box>
          
          <Divider />
          
          {/* Session Settings */}
          <Box>
            <Heading size="md" mb={4}>Session Settings</Heading>
            
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>
                  <HStack spacing={2}>
                    <Icon as={FiClock} />
                    <Text>Default Session Duration (minutes)</Text>
                  </HStack>
                </FormLabel>
                <Flex>
                  <NumberInput
                    min={5}
                    max={120}
                    value={settings.defaultSessionDuration}
                    onChange={(_, value) => handleNumberChange('defaultSessionDuration', value)}
                    maxW="100px"
                    mr={4}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Slider
                    flex="1"
                    min={5}
                    max={120}
                    value={settings.defaultSessionDuration}
                    onChange={(value) => handleNumberChange('defaultSessionDuration', value)}
                    focusThumbOnChange={false}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </Flex>
              </FormControl>
              
              <FormControl>
                <FormLabel>
                  <HStack spacing={2}>
                    <Icon as={FiClock} />
                    <Text>Default Break Duration (minutes)</Text>
                  </HStack>
                </FormLabel>
                <Flex>
                  <NumberInput
                    min={1}
                    max={30}
                    value={settings.defaultBreakDuration}
                    onChange={(_, value) => handleNumberChange('defaultBreakDuration', value)}
                    maxW="100px"
                    mr={4}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Slider
                    flex="1"
                    min={1}
                    max={30}
                    value={settings.defaultBreakDuration}
                    onChange={(value) => handleNumberChange('defaultBreakDuration', value)}
                    focusThumbOnChange={false}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </Flex>
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="auto-start-breaks" mb="0">
                  <HStack spacing={2}>
                    <Icon as={FiClock} />
                    <Text>Auto-start breaks</Text>
                  </HStack>
                </FormLabel>
                <Switch
                  id="auto-start-breaks"
                  name="autoStartBreaks"
                  isChecked={settings.autoStartBreaks}
                  onChange={handleChange}
                />
              </FormControl>
            </VStack>
          </Box>
          
          <Divider />
          
          {/* Notifications */}
          <Box>
            <Heading size="md" mb={4}>Notifications</Heading>
            
            <VStack spacing={4} align="stretch">
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="notifications-enabled" mb="0">
                  <HStack spacing={2}>
                    <Icon as={FiBell} />
                    <Text>Enable Notifications</Text>
                  </HStack>
                </FormLabel>
                <Switch
                  id="notifications-enabled"
                  name="notificationsEnabled"
                  isChecked={settings.notificationsEnabled}
                  onChange={handleChange}
                />
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="sound-enabled" mb="0">
                  <HStack spacing={2}>
                    <Icon as={FiVolume2} />
                    <Text>Enable Sound</Text>
                  </HStack>
                </FormLabel>
                <Switch
                  id="sound-enabled"
                  name="soundEnabled"
                  isChecked={settings.soundEnabled}
                  onChange={handleChange}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>
                  <HStack spacing={2}>
                    <Icon as={FiVolume2} />
                    <Text>Notification Sound</Text>
                  </HStack>
                </FormLabel>
                <Select
                  name="notificationSound"
                  value={settings.notificationSound}
                  onChange={handleChange}
                  isDisabled={!settings.soundEnabled}
                >
                  <option value="bell">Bell</option>
                  <option value="chime">Chime</option>
                  <option value="digital">Digital</option>
                  <option value="gentle">Gentle</option>
                </Select>
              </FormControl>
            </VStack>
          </Box>
        </VStack>
      </Box>
      
      {/* Action Buttons */}
      <HStack spacing={4} justify="flex-end">
        <Button
          variant="outline"
          onClick={resetSettings}
        >
          Reset to Defaults
        </Button>
        <Button
          colorScheme="brand"
          leftIcon={<Icon as={FiSave} />}
          onClick={saveSettings}
        >
          Save Settings
        </Button>
      </HStack>
    </Box>
  );
};

export default Settings;
