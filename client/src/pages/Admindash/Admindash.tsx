import React, { useState } from 'react';
import { Box, Container, Tabs, Tab, Typography } from '@mui/material';
import UserTable from './components/UserTable';
import TagTable from './components/TagTable';
import Navbar from '../../components/Navbar';

const AdminDash: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <>
      <Navbar></Navbar>
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Users" />
            <Tab label="Tags" />
          </Tabs>
        </Box>

        {activeTab === 0 && <UserTable />}
        {activeTab === 1 && <TagTable />}
      </Box>
    </Container>
    </>
  );
};

export default AdminDash;
