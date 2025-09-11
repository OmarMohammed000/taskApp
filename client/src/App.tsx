import React from 'react';
import './App.css';
import { ThemeContextProvider } from './context/ThemeContext';


function App() {
  return (
      <ThemeContextProvider>
      <main className="App">
        z
      </main>
      </ThemeContextProvider>
  );
}

export default App;
