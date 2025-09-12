import React from 'react';
import './App.css';
import { createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import AuthForm from './pages/AuthForm';
import { AuthProvider } from './context/AuthContext';
import {ThemeContextProvider as CustomThemeProvider} from './context/ThemeContext';
import { RouterProvider } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { UserProvider } from './context/UserContext';
const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        path: '/',
        element: <Home/>
      },
      {
        path: '/login',
        element: <AuthForm />
      },
      {
        path: '/register',
        element: <AuthForm isRegister={true} />
      },
    ]
  }
]);

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <UserProvider>
      <CustomThemeProvider>
        <RouterProvider router={router} />
      </CustomThemeProvider>
        </UserProvider>
    </SocketProvider>
    </AuthProvider>
  );
}