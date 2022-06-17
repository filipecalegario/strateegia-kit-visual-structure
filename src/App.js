import {
  ChakraProvider, theme
} from '@chakra-ui/react';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Signin from './pages/Signin';
import Main from './pages/Main';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Routes>
        <Route path="/" element={<Signin />} />
        <Route path="/main" element={<Main />} />
      </Routes>
    </ChakraProvider>
  );
}

export default App;
