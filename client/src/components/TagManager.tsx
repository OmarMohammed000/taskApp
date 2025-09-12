import React, { useState } from 'react';
import { 
  Box, 
  Chip, 
  IconButton, 
  TextField, 
  Button,
  Stack
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
    if (!newTagName.trim()) return;
    
    try {
      const newTag = await onCreateTag(newTagName.trim());
      if (!newTag || typeof newTag.id !== 'number') {
        console.error('TagManager: onCreateTag returned invalid tag', newTag);
        return;
      }
      await onAddTag(taskId, newTag.id);
      setNewTagName('');
    } catch (error) {
      console.error('Failed to create tag:', error);
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
      <Box display="flex" gap={1} alignItems="center">
        <TextField
          size="small"
          placeholder="New tag name..."
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
          sx={{ minWidth: 150 }}
        />
        <IconButton
          size="small"
          onClick={handleCreateTag}
          disabled={!newTagName.trim()}
        >
          <AddIcon />
        </IconButton>
      </Box>
    </Stack>
  );
};

export default TagManager;