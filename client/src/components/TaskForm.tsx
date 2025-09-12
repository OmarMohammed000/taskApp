import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Add as AddIcon } from '@mui/icons-material';
import { useUser } from '../context/UserContext';

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
  const {user} = useUser() ;
  const userId = user?.id;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    const taskData = {
      userId: userId,
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      due_date: dueDate ? dueDate.toISOString().split('T')[0] : undefined
    };

    try {
      await onSubmit(taskData);
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate(null);
      setExpanded(false);
    } catch (error) {
      console.error('Failed to create task:', error);
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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack spacing={2}>
        <Box display="flex" gap={1}>
          <TextField
            fullWidth
            size="small"
            placeholder={`Add a new ${taskType}...`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setExpanded(true)}
          />
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleSubmit}
            disabled={!title.trim() || loading}
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
              onChange={(e) => setDescription(e.target.value)}
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
                  onChange={setDueDate}
                  slotProps={{
                    textField: { size: 'small', sx: { minWidth: 150 } }
                  }}
                />
              )}
            </Box>

            <Box display="flex" gap={1} justifyContent="flex-end">
              <Button 
                size="small" 
                onClick={() => setExpanded(false)}
              >
                Cancel
              </Button>
              <Button 
                size="small" 
                variant="contained"
                onClick={handleSubmit}
                disabled={!title.trim() || loading}
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