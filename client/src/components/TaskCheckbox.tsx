import React from 'react';
import { IconButton, CircularProgress } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon
} from '@mui/icons-material';

interface TaskCheckboxProps {
  taskId: number;
  isCompleted: boolean;
  loading?: boolean;
  onToggle: (taskId: number) => Promise<void>;
}

const TaskCheckbox: React.FC<TaskCheckboxProps> = ({ 
  taskId, 
  isCompleted, 
  loading = false, 
  onToggle 
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(taskId);
  };

  return (
    <IconButton 
      size="small" 
      color={isCompleted ? 'success' : 'default'}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <CircularProgress size={20} />
      ) : isCompleted ? (
        <CheckCircleIcon />
      ) : (
        <RadioButtonUncheckedIcon />
      )}
    </IconButton>
  );
};

export default TaskCheckbox;