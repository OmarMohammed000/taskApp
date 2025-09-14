import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import EditUserForm from './EditUserForm';
import { useAuth } from '../../../context/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  level_number: number;
  xp: number;
  isAdmin: boolean;
}

const UserTable: React.FC = () => {
  const { makeRequest } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editUserDialog, setEditUserDialog] = useState(false);
 
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await makeRequest('/users/all');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [makeRequest]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUserDialog(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await makeRequest(`/users/${id}`, { method: 'DELETE' });
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleUserUpdated = () => {
    setEditUserDialog(false);
    fetchUsers();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>XP</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.level_number}</TableCell>
                <TableCell>{user.xp}</TableCell>
                <TableCell>{user.isAdmin ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditUser(user)} title="Edit user details">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteUser(user.id)} title="Delete user" color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={editUserDialog} onClose={() => setEditUserDialog(false)}>
        {selectedUser && (
          <EditUserForm 
            user={selectedUser} 
            onSuccess={handleUserUpdated} 
            onCancel={() => setEditUserDialog(false)} 
          />
        )}
      </Dialog>

      
    </Box>
  );
};

export default UserTable;
