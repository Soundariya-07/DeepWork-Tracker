import React from 'react';
import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Timer from './pages/Timer';
import SessionHistory from './pages/SessionHistory';
import theme from './theme';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <Router>
        <Routes>
          <Route path="/" element={<Timer />} />
          <Route path="/history" element={<SessionHistory />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
