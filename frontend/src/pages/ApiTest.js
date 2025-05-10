import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Button, VStack, Code, Alert, AlertIcon, Spinner, HStack, Divider } from '@chakra-ui/react';
import axios from 'axios';

const ApiTest = () => {
  const [apiStatus, setApiStatus] = useState('loading');
  const [apiResponse, setApiResponse] = useState(null);
  const [testDataResponse, setTestDataResponse] = useState(null);
  const [error, setError] = useState(null);
  const [testDataStatus, setTestDataStatus] = useState(null);

  const testApi = async () => {
    setApiStatus('loading');
    try {
      // Test the root endpoint
      const response = await axios.get('http://localhost:8000/', { timeout: 5000 });
      setApiResponse(response.data);
      setApiStatus('success');
    } catch (err) {
      console.error('API Test Error:', err);
      setError(err.message || 'Failed to connect to API');
      setApiStatus('error');
    }
  };

  const fetchTestData = async () => {
    setTestDataStatus('loading');
    try {
      // Test the test-data endpoint
      const response = await axios.get('http://localhost:8000/test-data', { timeout: 5000 });
      setTestDataResponse(response.data);
      setTestDataStatus('success');
    } catch (err) {
      console.error('Test Data Error:', err);
      setTestDataStatus('error');
    }
  };

  useEffect(() => {
    testApi();
  }, []);

  return (
    <Box p={5}>
      <Heading mb={4}>API Connection Test</Heading>
      
      <VStack align="stretch" spacing={4}>
        {apiStatus === 'loading' && (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" mb={4} />
            <Text>Testing API connection...</Text>
          </Box>
        )}
        
        {apiStatus === 'error' && (
          <Alert status="error">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Connection Error</Text>
              <Text>{error}</Text>
              <Text mt={2}>
                Make sure the backend server is running at http://localhost:8000
              </Text>
              <Text fontSize="sm" mt={2}>
                Try running the test backend with run-test-backend.bat
              </Text>
            </Box>
          </Alert>
        )}
        
        {apiStatus === 'success' && (
          <Alert status="success">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">API Connected Successfully!</Text>
              <Text>The backend API is running and responding.</Text>
            </Box>
          </Alert>
        )}
        
        {apiResponse && (
          <Box borderWidth={1} borderRadius="md" p={4}>
            <Heading size="md" mb={2}>API Response:</Heading>
            <Code p={2} borderRadius="md" display="block" whiteSpace="pre">
              {JSON.stringify(apiResponse, null, 2)}
            </Code>
          </Box>
        )}
        
        <HStack spacing={4}>
          <Button colorScheme="blue" onClick={testApi} isLoading={apiStatus === 'loading'}>
            Test API Connection
          </Button>
          
          <Button 
            colorScheme="green" 
            onClick={fetchTestData} 
            isLoading={testDataStatus === 'loading'}
            isDisabled={apiStatus !== 'success'}
          >
            Fetch Test Data
          </Button>
        </HStack>
        
        <Divider my={2} />
        
        {testDataStatus === 'loading' && (
          <Box textAlign="center" py={4}>
            <Spinner size="md" mb={2} />
            <Text>Fetching test data...</Text>
          </Box>
        )}
        
        {testDataStatus === 'error' && (
          <Alert status="error">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Test Data Error</Text>
              <Text>Failed to fetch test data from the backend.</Text>
            </Box>
          </Alert>
        )}
        
        {testDataResponse && (
          <Box borderWidth={1} borderRadius="md" p={4}>
            <Heading size="md" mb={2}>Test Data Response:</Heading>
            <Code p={2} borderRadius="md" display="block" whiteSpace="pre">
              {JSON.stringify(testDataResponse, null, 2)}
            </Code>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default ApiTest;
