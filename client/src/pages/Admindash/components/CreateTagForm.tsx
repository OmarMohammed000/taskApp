import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { useAuth } from '../../../context/AuthContext';

interface CreateTagFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateTagForm: React.FC<CreateTagFormProps> = ({ onSuccess, onCancel }) => {
  const { makeRequest } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setError('');
    setLoading(true);

    try {
      await makeRequest('/tags', {
        method: 'POST',
        data: { name }
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error creating tag:', error);
      setError(error.response?.data?.message || 'Failed to create tag. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogTitle>Create New Tag</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <TextField
            fullWidth
            margin="normal"
            label="Tag Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !name.trim()}
        >
          {loading ? 'Creating...' : 'Create Tag'}
        </Button>
      </DialogActions>
    </>
  );
};


export default CreateTagForm;
