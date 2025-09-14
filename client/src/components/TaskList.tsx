import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Collapse,
  LinearProgress,
  Divider,
  Stack,
  useTheme,
  Grid
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import TaskForm from './TaskForm';
import TaskEditForm from './TaskEditForm';
import TaskCheckbox from './TaskCheckbox';
import TagManager from './TagManager';
import ErrorNotification from './ErrorNotification';
import { parseApiError, ApiError } from '../utils/errorHandler';

// Types based on your backend structure
interface Tag {
  id: number;
  name: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  is_completed: boolean;
  priority: 'low' | 'medium' | 'high';
  task_type: 'habit' | 'todo';
  due_date?: string;
  created_at: string;
  xp_reward: 25 | 50;
  streak_count?: number;
  tags?: Tag[];
}

const TaskList: React.FC = () => {
  const {user} = useUser();
  const id  = user?.id;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskLoading, setTaskLoading] = useState<Record<number, boolean>>({});
  const theme = useTheme();

  const { makeRequest } = useAuth();
  const { updateProgress } = useUser();

  const habits = tasks.filter(task => task.task_type === 'habit');
  const todos = tasks.filter(task => task.task_type === 'todo');

  const showError = (error: any) => {
    const apiError = parseApiError(error);
    setError(apiError.message);
  };

  const setTaskLoadingState = (taskId: number, loading: boolean) => {
    setTaskLoading(prev => ({ ...prev, [taskId]: loading }));
  };

  const fetchTasks = useCallback(async () => {
    try {
      if (!id) return;
      const response = await makeRequest(`/tasks/user/${id}/with-tags`, { method: 'GET' });
      const payload = response.data;

      const tasksArray: any[] = Array.isArray(payload) ? payload : (payload.tasks || []);

      const normalized = tasksArray.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        is_completed: t.status === 'completed',
        priority: t.priority ?? 'medium',
        task_type: t.category as 'habit' | 'todo',
        due_date: t.due_date,
        created_at: t.created_at ?? new Date().toISOString(),
        xp_reward: t.xp_value as 25 | 50,
        tags: Array.isArray(t.tags) ? t.tags : []
      }));

      setTasks(normalized);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      showError(error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [id, makeRequest]);

  const fetchTags = useCallback(async (): Promise<Tag[]> => {
    try {
      const response = await makeRequest('/tags', { method: 'GET' });
      setTags(response.data);
      return response.data as Tag[];
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      showError(error);
      return [];
    }
  }, [makeRequest]);

  useEffect(() => {
    if (!id) return;
    fetchTasks();
    fetchTags();
  }, [id, fetchTasks, fetchTags]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette .grey[500];
    }
  };

  const handleTaskToggle = (taskId: number) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
    setEditingTask(null);
  };

  const handleAddTag = async (taskId: number, tagId: number) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const isTagAlreadyAssigned = task?.tags?.some(tag => tag.id === tagId);
      
      if (isTagAlreadyAssigned) {
        setError('Tag is already assigned to this task');
        return;
      }

      await makeRequest(`/tags/add`, {
        method: 'POST',
        data: { taskId, tagId }
      });

      const updatedTaskResponse = await makeRequest(`/tags/tasks/${taskId}`, { method: 'GET' });
      const updatedTaskData = updatedTaskResponse.data[0];

      if (updatedTaskData) {
        setTasks(prev => prev.map(t => 
          t.id === taskId 
            ? { 
                ...t, 
                tags: Array.isArray(updatedTaskData.tags) ? updatedTaskData.tags : []
              }
            : t
        ));
      }
    } catch (error: any) {
      console.error('Failed to add tag to task:', error);
      showError(error);
    }
  };

  const handleRemoveTag = async (taskId: number, tagId: number) => {
    try {
      await makeRequest(`/tags/remove`, {
        method: 'DELETE',
        data: { taskId, tagId }
      });
      
      const updatedTaskResponse = await makeRequest(`/tags/tasks/${taskId}`, { method: 'GET' });
      const updatedTaskData = updatedTaskResponse.data[0];

      if (updatedTaskData) {
        setTasks(prev => prev.map(t => 
          t.id === taskId 
            ? { 
                ...t, 
                tags: Array.isArray(updatedTaskData.tags) ? updatedTaskData.tags : []
              }
            : t
        ));
      }
    } catch (error: any) {
      console.error('Failed to remove tag from task:', error);
      showError(error);
    }
  };

  const handleCreateTask = async (taskData: {
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    due_date?: string;
  }, taskType: 'habit' | 'todo') => {
    try {
      const response = await makeRequest('/tasks', {
        method: 'POST',
        data: { ...taskData, category: taskType }
      });
      
      await fetchTasks();
    } catch (error: any) {
      console.error('Failed to create task:', error);
      showError(error);
      throw error; // Re-throw so TaskForm can handle it
    }
  };

  const handleToggleCompletion = async (taskId: number) => {
    setTaskLoadingState(taskId, true);
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const response = await makeRequest(`/tasks/${taskId}/complete`, {
        method: 'PATCH'
      });

      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, is_completed: !t.is_completed } : t
      ));

      if (!task.is_completed && response.data.xpGained) {
        await updateProgress(response.data.xpGained);
      }
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
      showError(error);
    } finally {
      setTaskLoadingState(taskId, false);
    }
  };

  const handleUpdateTask = async (taskId: number, updates: Partial<Task>) => {
    try {
      const response = await makeRequest(`/tasks/${taskId}`, {
        method: 'PATCH',
        data: updates
      });

      await fetchTasks();
      setEditingTask(null);
    } catch (error: any) {
      console.error('Failed to update task:', error);
      showError(error);
      throw error; // Re-throw so TaskEditForm can handle it
    }
  };

  const handlePriorityChange = async (taskId: number, priority: 'low' | 'medium' | 'high') => {
    const previous = tasks.find(t => t.id === taskId)?.priority;

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, priority } : t));

    try {
      await handleUpdateTask(taskId, { priority });
    } catch (err) {
      console.error('Failed to change priority:', err);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, priority: previous ?? 'medium' } : t));
      showError(err);
    }
  };

  const handleCreateTag = async (name: string): Promise<Tag> => {
    try {
      const response = await makeRequest('/tags', {
        method: 'POST',
        data: { name }
      });

      let newTag: any = response.data;
      if (Array.isArray(newTag) && newTag.length > 0) {
        newTag = newTag[0];
      }

      if (newTag && typeof newTag.id === 'number') {
        setTags(prev => [...prev, newTag]);
        return newTag as Tag;
      }

      const allTags = await fetchTags();
      const found = allTags.find(t => t.name.toLowerCase() === name.toLowerCase());
      if (found) {
        return found;
      }

      const loc = (response && (response.headers?.location || response.headers?.Location)) as string | undefined;
      if (loc) {
        const m = loc.match(/\/(\d+)(?:\/)?$/);
        if (m) {
          const id = Number(m[1]);
          const refreshed = await fetchTags();
          const byId = refreshed.find(t => t.id === id);
          if (byId) return byId;
          const constructed = { id, name };
          setTags(prev => [...prev, constructed]);
          return constructed as Tag;
        }
      }

      throw new Error('Unable to determine created tag id or object after POST /tags');
    } catch (error) {
      console.error('Failed to create tag:', error);
      showError(error);
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this task?');
    if (!confirmed) return;

    setTaskLoadingState(taskId, true);
    try {
      await makeRequest(`/tasks/${taskId}`, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => t.id !== taskId));
      if (expandedTask === taskId) setExpandedTask(null);
      if (editingTask === taskId) setEditingTask(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
      showError(error);
    } finally {
      setTaskLoadingState(taskId, false);
    }
  };

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const isExpanded = expandedTask === task.id;
    const isEditing = editingTask === task.id;
    const isLoading = taskLoading[task.id] || false;
    
    return (
      <Card 
        sx={{ 
          mb: 1, 
          border: `2px solid ${getPriorityColor(task.priority)}`,
          borderRadius: 2,
          opacity: isLoading ? 0.7 : 1
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="space-between"
            onClick={() => handleTaskToggle(task.id)}
            sx={{ cursor: 'pointer' }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <TaskCheckbox
                taskId={task.id}
                isCompleted={task.is_completed}
                loading={isLoading}
                onToggle={handleToggleCompletion}
              />
              <Typography 
                variant="body1" 
                sx={{ 
                  textDecoration: task.is_completed ? 'line-through' : 'none',
                  opacity: task.is_completed ? 0.6 : 1
                }}
              >
                {task.title}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTask(task.id);
                }}
                disabled={isLoading}
                aria-label="delete task"
              >
                <DeleteIcon />
              </IconButton>

              <IconButton size="small" disabled={isLoading}>
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Box>

          {/* Show tags when collapsed */}
          {!isExpanded && task.tags && task.tags.length > 0 && (
            <Box mt={1}>
              <TagManager
                taskId={task.id}
                tags={task.tags}
                availableTags={tags}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
                onCreateTag={handleCreateTag}
                expanded={false}
              />
            </Box>
          )}

          <Collapse in={isExpanded}>
            <Divider sx={{ my: 2 }} />
            
            {isEditing ? (
              <TaskEditForm
                task={task}
                availableTags={tags}
                onSave={handleUpdateTask}
                onCancel={() => setEditingTask(null)}
                onPriorityChange={handlePriorityChange}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
                onCreateTag={handleCreateTag}
              />
            ) : (
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Task Details</Typography>
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTask(task.id);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Box>

                {task.description && (
                  <Typography variant="body2" color="text.secondary">
                    {task.description}
                  </Typography>
                )}
                
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="caption" color="text.secondary">
                    Priority: 
                  </Typography>
                  <Chip 
                    label={task.priority.toUpperCase()} 
                    size="small" 
                    sx={{ 
                      backgroundColor: getPriorityColor(task.priority),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>

                {/* Tags Section */}
                {task.tags && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Tags:
                    </Typography>
                    <TagManager
                      taskId={task.id}
                      tags={task.tags}
                      availableTags={tags}
                      onAddTag={handleAddTag}
                      onRemoveTag={handleRemoveTag}
                      onCreateTag={handleCreateTag}
                      expanded={true}
                    />
                  </Box>
                )}

                {task.due_date && (
                  <Typography variant="caption" color="text.secondary">
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </Typography>
                )}

                {task.task_type === 'habit' && task.streak_count !== undefined && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Streak Progress
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(task.streak_count / 30) * 100} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {task.streak_count}/30 days
                    </Typography>
                  </Box>
                )}
              </Stack>
            )}
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading tasks...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <ErrorNotification 
        error={error} 
        onClose={() => setError(null)} 
      />
      
      <Grid container spacing={4}>
        {/* Habits Column */}
        <Grid size={{xs:12, md:6}}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
                Habits
              </Typography>
              
              <TaskForm
                taskType="habit"
                onSubmit={(taskData) => handleCreateTask(taskData, 'habit')}
              />

              <Box mt={3}>
                {habits.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Typography variant="body2" color="text.secondary">
                      No habits yet. Create your first habit!
                    </Typography>
                  </Box>
                ) : (
                  habits.map(task => <TaskCard key={task.id} task={task} />)
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Todos Column */}
        <Grid size={{xs:12, md:6}}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom color="secondary" fontWeight="bold">
                To Do's
              </Typography>
              
              <TaskForm
                taskType="todo"
                onSubmit={(taskData) => handleCreateTask(taskData, 'todo')}
              />

              <Box mt={3}>
                {todos.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Typography variant="body2" color="text.secondary">
                      No todos yet. Add your first task!
                    </Typography>
                  </Box>
                ) : (
                  todos.map(task => <TaskCard key={task.id} task={task} />)
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskList;