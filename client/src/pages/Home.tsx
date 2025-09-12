import react from 'react';
import Navbar from '../components/Navbar';
import TaskList from '../components/TaskList';

export default function Home() {
  return (
    <div>
      <Navbar></Navbar>
      <TaskList></TaskList>
      <h1>Welcome to the Home Page</h1>
    </div>
  );
}