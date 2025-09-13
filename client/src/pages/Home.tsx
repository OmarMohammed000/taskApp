import react, { use } from 'react';
import Navbar from '../components/Navbar';
import TaskList from '../components/TaskList';
import { useAuth } from '../context/AuthContext';
import Typography from '@mui/material/Typography';

export default function Home() {
  const { isAuthenticated } = useAuth();
  return (
    <div>
      <Navbar></Navbar>
      <Typography variant="h4" sx={{textAlign: 'center' ,mt: 4}}>Welcome to the Home Page</Typography>
      {isAuthenticated ? <TaskList></TaskList> : <Typography variant='h5' sx={{textAlign: 'center', mt: 2}}>Please log in to see your tasks.</Typography>}
      
    </div>
  );
}