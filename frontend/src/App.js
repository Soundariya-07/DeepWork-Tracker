import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, useColorMode } from '@chakra-ui/react';

// Import components
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SessionList from './pages/SessionList';
import SessionDetail from './pages/SessionDetail';
import ActiveSession from './pages/ActiveSession';
import SessionHistory from './pages/SessionHistory';
import Settings from './pages/Settings';
import ApiTest from './pages/ApiTest';

function App() {
  const { colorMode } = useColorMode();
  
  return (
    <Box 
      bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'} 
      color={colorMode === 'dark' ? 'white' : 'gray.800'}
      minH="100vh"
    >
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="sessions" element={<SessionList />} />
          <Route path="sessions/:sessionId" element={<SessionDetail />} />
          <Route path="active-session/:sessionId?" element={<ActiveSession />} />
          <Route path="history" element={<SessionHistory />} />
          <Route path="settings" element={<Settings />} />
          <Route path="api-test" element={<ApiTest />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;
