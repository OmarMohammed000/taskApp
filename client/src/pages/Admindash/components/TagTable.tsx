import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
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
import { Edit, Delete, Add } from '@mui/icons-material';
import EditTagForm from './EditTagForm';
import CreateTagForm from './CreateTagForm';
import { useAuth } from '../../../context/AuthContext';

interface Tag {
  id: string;
  name: string;
}

const TagTable: React.FC = () => {
  const { makeRequest } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await makeRequest('/tags');
      setTags(response.data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleEditTag = (tag: Tag) => {
    setSelectedTag(tag);
    setEditDialog(true);
  };

  const handleDeleteTag = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      try {
        await makeRequest(`/tags/${id}`, { method: 'DELETE' });
        fetchTags();
      } catch (error) {
        console.error('Failed to delete tag:', error);
      }
    }
  };

  const handleTagUpdated = () => {
    setEditDialog(false);
    setCreateDialog(false);
    fetchTags();
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialog(true)}
        >
          Add Tag
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell>{tag.id}</TableCell>
                <TableCell>{tag.name}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditTag(tag)} title="Edit tag">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteTag(tag.id)} title="Delete tag" color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
        {selectedTag && (
          <EditTagForm 
            tag={selectedTag} 
            onSuccess={handleTagUpdated} 
            onCancel={() => setEditDialog(false)} 
          />
        )}
      </Dialog>

      <Dialog open={createDialog} onClose={() => setCreateDialog(false)}>
        <CreateTagForm 
          onSuccess={handleTagUpdated} 
          onCancel={() => setCreateDialog(false)} 
        />
      </Dialog>
    </Box>
  );
};

export default TagTable;
