import React, { useState } from 'react';
import { 
  FormControl, 
  Select, 
  MenuItem, 
  Chip, 
  Box,
  SelectChangeEvent 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface PrioritySelectorProps {
  taskId: number;
  currentPriority: 'low' | 'medium' | 'high';
  onPriorityChange: (taskId: number, priority: 'low' | 'medium' | 'high') => Promise<void>;
  disabled?: boolean;
}

const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  taskId,
  currentPriority,
  onPriorityChange,
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const handleChange = async (event: SelectChangeEvent) => {
    const newPriority = event.target.value as 'low' | 'medium' | 'high';
    setLoading(true);
    try {
      await onPriorityChange(taskId, newPriority);
    } catch (error) {
      console.error('Failed to update priority:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="inline-block">
      <FormControl size="small" disabled={disabled || loading}>
        <Select
          value={currentPriority}
          onChange={handleChange}
          renderValue={(value) => (
            <Chip
              label={value.toUpperCase()}
              size="small"
              sx={{
                backgroundColor: getPriorityColor(value),
                color: 'white',
                fontWeight: 'bold',
                border: 'none'
              }}
            />
          )}
        >
          <MenuItem value="low">
            <Chip label="LOW" size="small" sx={{ backgroundColor: getPriorityColor('low'), color: 'white' }} />
          </MenuItem>
          <MenuItem value="medium">
            <Chip label="MEDIUM" size="small" sx={{ backgroundColor: getPriorityColor('medium'), color: 'white' }} />
          </MenuItem>
          <MenuItem value="high">
            <Chip label="HIGH" size="small" sx={{ backgroundColor: getPriorityColor('high'), color: 'white' }} />
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default PrioritySelector;