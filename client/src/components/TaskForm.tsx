import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  FormHelperText
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Add as AddIcon } from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import { validateDate, validateTitle, validateDescription } from '../utils/errorHandler';

interface TaskFormProps {
  taskType: 'habit' | 'todo';
  onSubmit: (taskData: {
    userId: number | undefined;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    due_date?: string;
  }) => Promise<void>;
  loading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ taskType, onSubmit, loading = false }) => {
  const {user} = useUser();
  const userId = user?.id;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    const titleError = validateTitle(title);
    if (titleError) newErrors.title = titleError;
    
    const descError = validateDescription(description);
    if (descError) newErrors.description = descError;
    
    if (taskType === 'todo' && dueDate) {
      const dateError = validateDate(dueDate, 'Due date');
      if (dateError) newErrors.dueDate = dateError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    const taskData = {
      userId: userId,
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      due_date: dueDate ? dueDate.toISOString().split('T')[0] : undefined
    };

    try {
      await onSubmit(taskData);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate(null);
      setExpanded(false);
      setErrors({});
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!expanded) {
        setExpanded(true);
      } else {
        handleSubmit();
      }
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
      <Stack spacing={2}>
        <Box display="flex" gap={1}>
          <TextField
            fullWidth
            size="small"
            placeholder={`Add a new ${taskType}...`}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setExpanded(true)}
            error={!!errors.title}
            helperText={errors.title}
          />
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleSubmit}
            disabled={!title.trim() || loading || submitting || !!errors.title}
            color={taskType === 'habit' ? 'primary' : 'secondary'}
          >
            Add
          </Button>
        </Box>

        {expanded && (
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              placeholder="Description (optional)..."
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              error={!!errors.description}
              helperText={errors.description}
            />

            <Box display="flex" gap={2}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priority}
                  label="Priority"
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>

              {taskType === 'todo' && (
                <DatePicker
                  label="Due Date"
                  value={dueDate}
                  onChange={handleDueDateChange}
                  minDate={new Date()}
                  slotProps={{
                    textField: { 
                      size: 'small', 
                      sx: { minWidth: 150 },
                      error: !!errors.dueDate,
                      helperText: errors.dueDate
                    }
                  }}
                />
              )}
            </Box>

            <Box display="flex" gap={1} justifyContent="flex-end">
              <Button 
                size="small" 
                onClick={() => {
                  setExpanded(false);
                  setErrors({});
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                size="small" 
                variant="contained"
                onClick={handleSubmit}
                disabled={!title.trim() || loading || submitting || Object.keys(errors).some(key => !!errors[key])}
                color={taskType === 'habit' ? 'primary' : 'secondary'}
              >
                Create {taskType}
              </Button>
            </Box>
          </Stack>
        )}
      </Stack>
    </LocalizationProvider>
  );
};

export default TaskForm;