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

interface Tag {
  id: string;
  name: string;
}

interface EditTagFormProps {
  tag: Tag;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditTagForm: React.FC<EditTagFormProps> = ({ tag, onSuccess, onCancel }) => {
  const { makeRequest } = useAuth();
  const [name, setName] = useState(tag.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await makeRequest(`/tags/${tag.id}`, {
        method: 'PATCH',
        data: { name }
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error updating tag:', error);
      setError(error.response?.data?.message || 'Failed to update tag. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogTitle>Edit Tag</DialogTitle>
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
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </>
  );
};


export default EditTagForm;
