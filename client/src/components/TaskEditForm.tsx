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
import { validateDate, validateTitle, validateDescription } from '../utils/errorHandler';

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    const titleError = validateTitle(title);
    if (titleError) newErrors.title = titleError;
    
    const descError = validateDescription(description);
    if (descError) newErrors.description = descError;
    
    if (dueDate) {
      const dateError = validateDate(dueDate, 'Due date');
      if (dateError) newErrors.dueDate = dateError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

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

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (errors.title) {
      const titleError = validateTitle(value);
      setErrors(prev => ({ ...prev, title: titleError || '' }));
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (errors.description) {
      const descError = validateDescription(value);
      setErrors(prev => ({ ...prev, description: descError || '' }));
    }
  };

  const handleDueDateChange = (date: Date | null) => {
    setDueDate(date);
    if (errors.dueDate && date) {
      const dateError = validateDate(date, 'Due date');
      setErrors(prev => ({ ...prev, dueDate: dateError || '' }));
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
          onChange={(e) => handleTitleChange(e.target.value)}
          error={!!errors.title}
          helperText={errors.title}
        />

        <TextField
          fullWidth
          size="small"
          multiline
          rows={2}
          label="Description"
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          error={!!errors.description}
          helperText={errors.description}
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
          onChange={handleDueDateChange}
          minDate={new Date()}
          slotProps={{
            textField: { 
              size: 'small', 
              fullWidth: true,
              error: !!errors.dueDate,
              helperText: errors.dueDate
            }
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
          <Button size="small" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button 
            size="small" 
            variant="contained"
            onClick={handleSave}
            disabled={!title.trim() || loading || Object.keys(errors).some(key => !!errors[key])}
          >
            Save Changes
          </Button>
        </Box>
      </Stack>
    </LocalizationProvider>
  );
};

export default TaskEditForm;