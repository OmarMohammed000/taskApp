import React, { useState } from 'react';
import { 
  Box, 
  Chip, 
  IconButton, 
  TextField, 
  Button,
  Stack,
  FormHelperText
} from '@mui/material';
import { 
  LocalOffer as TagIcon, 
  Close as CloseIcon, 
  Add as AddIcon 
} from '@mui/icons-material';

interface Tag {
  id: number;
  name: string;
}

interface TagManagerProps {
  taskId: number;
  tags: Tag[];
  availableTags: Tag[];
  onAddTag: (taskId: number, tagId: number) => Promise<void>;
  onRemoveTag: (taskId: number, tagId: number) => Promise<void>;
  onCreateTag: (name: string) => Promise<Tag>;
  expanded?: boolean;
}

const TagManager: React.FC<TagManagerProps> = ({
  taskId,
  tags,
  availableTags,
  onAddTag,
  onRemoveTag,
  onCreateTag,
  expanded = false
}) => {
  const [newTagName, setNewTagName] = useState('');
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  const validateTagName = (name: string): string => {
    if (!name.trim()) return 'Tag name is required';
    if (name.length < 2) return 'Tag name must be at least 2 characters';
    if (name.length > 50) return 'Tag name must be less than 50 characters';
    if (!/^[a-zA-Z0-9\s-_]+$/.test(name)) return 'Tag name can only contain letters, numbers, spaces, hyphens, and underscores';
    return '';
  };

  const handleRemoveTag = async (tagId: number) => {
    setLoading(tagId);
    try {
      await onRemoveTag(taskId, tagId);
    } catch (error) {
      console.error('Failed to remove tag:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleAddTag = async (tagId: number) => {
    setLoading(tagId);
    try {
      await onAddTag(taskId, tagId);
    } catch (error) {
      console.error('Failed to add tag:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleCreateTag = async () => {
    const trimmedName = newTagName.trim();
    const validationError = validateTagName(trimmedName);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    // Check if tag already exists
    const existingTag = availableTags.find(tag => 
      tag.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (existingTag) {
      setError('A tag with this name already exists');
      return;
    }
    
    try {
      const newTag = await onCreateTag(trimmedName);
      if (!newTag || typeof newTag.id !== 'number') {
        console.error('TagManager: onCreateTag returned invalid tag', newTag);
        return;
      }
      await onAddTag(taskId, newTag.id);
      setNewTagName('');
      setError('');
    } catch (error) {
      console.error('Failed to create tag:', error);
      setError('Failed to create tag. Please try again.');
    }
  };

  const handleTagNameChange = (value: string) => {
    setNewTagName(value);
    if (error) {
      const validationError = validateTagName(value.trim());
      setError(validationError);
    }
  };

  const unassignedTags = availableTags.filter(
    availableTag => !tags.some(tag => tag.id === availableTag.id)
  );

  if (!expanded) {
    // Collapsed view - show first 3 tags
    return (
      <Box display="flex" gap={0.5} flexWrap="wrap">
        {tags.slice(0, 3).map((tag) => (
          <Chip
            key={tag.id}
            label={tag.name}
            size="small"
            variant="outlined"
            icon={<TagIcon />}
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
        ))}
        {tags.length > 3 && (
          <Chip
            label={`+${tags.length - 3}`}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
        )}
      </Box>
    );
  }

  // Expanded view - full tag management
  return (
    <Stack spacing={1}>
      {/* Current tags */}
      {tags.length > 0 && (
        <Box display="flex" gap={0.5} flexWrap="wrap">
          {tags.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              size="small"
              variant="outlined"
              icon={<TagIcon />}
              color="info"
              deleteIcon={<CloseIcon />}
              onDelete={() => handleRemoveTag(tag.id)}
              disabled={loading === tag.id}
            />
          ))}
        </Box>
      )}

      {/* Add existing tags */}
      {unassignedTags.length > 0 && (
        <Box display="flex" gap={0.5} flexWrap="wrap">
          {unassignedTags.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              size="small"
              variant="outlined"
              clickable
              onClick={() => handleAddTag(tag.id)}
              disabled={loading === tag.id}
              sx={{ opacity: 0.7 }}
            />
          ))}
        </Box>
      )}

      {/* Create new tag */}
      <Box display="flex" gap={1} alignItems="flex-start" flexDirection="column">
        <Box display="flex" gap={1} alignItems="center" width="100%">
          <TextField
            size="small"
            placeholder="New tag name..."
            value={newTagName}
            onChange={(e) => handleTagNameChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
            error={!!error}
            sx={{ minWidth: 150, flexGrow: 1 }}
          />
          <IconButton
            size="small"
            onClick={handleCreateTag}
            disabled={!newTagName.trim() || !!error}
          >
            <AddIcon />
          </IconButton>
        </Box>
        {error && (
          <FormHelperText error sx={{ margin: 0 }}>
            {error}
          </FormHelperText>
        )}
      </Box>
    </Stack>
  );
};

export default TagManager;