import React, { useState } from 'react';
import { 
  Stack, 
  TextField, 
  Button, 
  Box,
  Typography
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PrioritySelector from './PrioritySelector';
import TagManager from './TagManager';

interface Tag {
  id: number;
  name: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  tags?: Tag[];
}

interface TaskEditFormProps {
  task: Task;
  availableTags: Tag[];
  onSave: (taskId: number, updates: Partial<Task>) => Promise<void>;
  onCancel: () => void;
  onPriorityChange: (taskId: number, priority: 'low' | 'medium' | 'high') => Promise<void>;
  onAddTag: (taskId: number, tagId: number) => Promise<void>;
  onRemoveTag: (taskId: number, tagId: number) => Promise<void>;
  onCreateTag: (name: string) => Promise<Tag>;
}

const TaskEditForm: React.FC<TaskEditFormProps> = ({
  task,
  availableTags,
  onSave,
  onCancel,
  onPriorityChange,
  onAddTag,
  onRemoveTag,
  onCreateTag
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState<Date | null>(
    task.due_date ? new Date(task.due_date) : null
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates: Partial<Task> = {
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: dueDate ? dueDate.toISOString().split('T')[0] : undefined
      };
      await onSave(task.id, updates);
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack spacing={2} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextField
          fullWidth
          size="small"
          multiline
          rows={2}
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Box display="flex" gap={2} alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Priority:
          </Typography>
          <PrioritySelector
            taskId={task.id}
            currentPriority={task.priority}
            onPriorityChange={onPriorityChange}
          />
        </Box>

        <DatePicker
          label="Due Date"
          value={dueDate}
          onChange={setDueDate}
          slotProps={{
            textField: { size: 'small', fullWidth: true }
          }}
        />

        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Tags:
          </Typography>
          <TagManager
            taskId={task.id}
            tags={task.tags || []}
            availableTags={availableTags}
            onAddTag={onAddTag}
            onRemoveTag={onRemoveTag}
            onCreateTag={onCreateTag}
            expanded={true}
          />
        </Box>

        <Box display="flex" gap={1} justifyContent="flex-end">
          <Button size="small" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            size="small" 
            variant="contained"
            onClick={handleSave}
            disabled={!title.trim() || loading}
          >
            Save Changes
          </Button>
        </Box>
      </Stack>
    </LocalizationProvider>
  );
};

export default TaskEditForm;