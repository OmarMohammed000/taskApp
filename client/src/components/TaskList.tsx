import React, { useState, useEffect } from 'react';
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
  Delete as DeleteIcon // added delete icon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import TaskForm from './TaskForm';
import TaskEditForm from './TaskEditForm';
import TaskCheckbox from './TaskCheckbox';
import TagManager from './TagManager';

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
  const theme = useTheme();

  const { makeRequest } = useAuth();
  const { updateProgress } = useUser();

  const habits = tasks.filter(task => task.task_type === 'habit');
  const todos = tasks.filter(task => task.task_type === 'todo');

  // Fetch tasks and tags on component mount
  // wait for user id, then fetch
  useEffect(() => {
    if (!id) return;
    fetchTasks();
    fetchTags();
  }, [id]);
  
  const fetchTasks = async () => {
    try {
      if (!id) return;
      const response = await makeRequest(`/tasks/user/${id}`, { method: 'GET' });
      const payload = response.data;

      // response.data might be { tasks: [...] } or an array directly.
      const tasksArray: any[] = Array.isArray(payload) ? payload : (payload.tasks || []);

      // normalize server fields to the client Task interface
      const normalized = tasksArray.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        // server uses 'status' or boolean; treat 'completed' as true
        is_completed: t.is_completed ?? (t.status === 'completed'),
        // prefer explicit priority if provided, otherwise default
        priority: t.priority ?? (t.priority as any) ?? 'medium',
        // server uses 'category' for task type
        task_type: (t.task_type ?? t.category) as 'habit' | 'todo',
        // store full ISO string; UI formats it when rendering
        due_date: t.due_date,
        created_at: t.created_at ?? new Date().toISOString(),
        xp_reward: (t.xp_value ?? t.xp_reward) as 25 | 50,
        streak_count: t.streak_count,
        tags: t.tags ?? []
      }));

      setTasks(normalized);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async (): Promise<Tag[]> => {
    try {
      const response = await makeRequest('/tags', { method: 'GET' });
      setTags(response.data);
      return response.data as Tag[];
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      return [];
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const handleTaskToggle = (taskId: number) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
    setEditingTask(null); // Close edit form when toggling
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
      setTasks(prev => [...prev, response.data]);
      fetchTasks(); // refresh to get normalized data
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };

  const handleToggleCompletion = async (taskId: number) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const response = await makeRequest(`/tasks/${taskId}/complete`, {
        method: 'PATCH'
      });

      // Update local state
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, is_completed: !t.is_completed } : t
      ));

      // Update user progress if task was completed
      if (!task.is_completed && response.data.xpGained) {
        await updateProgress(response.data.xpGained);
      }
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
    }
  };

  const handleUpdateTask = async (taskId: number, updates: Partial<Task>) => {
    try {
      const response = await makeRequest(`/tasks/${taskId}`, {
        method: 'PATCH',
        data: updates
      });

      // Normalize server response: many endpoints return { message, task: [ {...} ] }
      let serverTask: any = response?.data;
      if (serverTask?.task) serverTask = Array.isArray(serverTask.task) ? serverTask.task[0] : serverTask.task;
      if (Array.isArray(serverTask)) serverTask = serverTask[0];

      // Merge existing local task, server response (if any), and the updates we sent.
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, ...(serverTask || {}), ...updates } : t
      ));

      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const handlePriorityChange = async (taskId: number, priority: 'low' | 'medium' | 'high') => {
    // Optimistic update: show change immediately and remember previous value to revert on failure
    const previous = tasks.find(t => t.id === taskId)?.priority;

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, priority } : t));

    try {
      await handleUpdateTask(taskId, { priority });
    } catch (err) {
      console.error('Failed to change priority:', err);
      // revert single task to previous value on failure
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, priority: previous ?? 'medium' } : t));
      // optionally refetch tasks: fetchTasks();
    }
  };

  const handleAddTag = async (taskId: number, tagId: number) => {
    try {
      
        await makeRequest(`/tags/add`, {
          method: 'POST',
          data: { taskId, tagId }
        });
      

      // Update local state
      const tag = tags.find(t => t.id === tagId);
      if (tag) {
        setTasks(prev => prev.map(t => 
          t.id === taskId 
            ? { ...t, tags: [...(t.tags || []), tag] }
            : t
        ));
      }
    } catch (error) {
      console.error('Failed to add tag to task:', error);
      throw error;
    }
  };

  const handleRemoveTag = async (taskId: number, tagId: number) => {
    try {
      await makeRequest(`/tags/remove`, {
        method: 'DELETE',
        data: { taskId, tagId }
      });
      
      // Update local state
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, tags: (t.tags || []).filter(tag => tag.id !== tagId) }
          : t
      ));
    } catch (error) {
      console.error('Failed to remove tag from task:', error);
      throw error;
    }
  };

  const handleCreateTag = async (name: string): Promise<Tag> => {
    try {
      const response = await makeRequest('/tags', {
        method: 'POST',
        data: { name }
      });

      // Normalize server reply
      let newTag: any = response.data;
      if (Array.isArray(newTag) && newTag.length > 0) {
        newTag = newTag[0];
      }

      // If server returned the created tag with an id, use it
      if (newTag && typeof newTag.id === 'number') {
        setTags(prev => [...prev, newTag]);
        return newTag as Tag;
      }

      // Otherwise, try to refresh tags and find the new tag by name
      const allTags = await fetchTags();
      const found = allTags.find(t => t.name.toLowerCase() === name.toLowerCase());
      if (found) {
        return found;
      }

      // Fallback: try to parse Location header like "/tags/123"
      const loc = (response && (response.headers?.location || response.headers?.Location)) as string | undefined;
      if (loc) {
        const m = loc.match(/\/(\d+)(?:\/)?$/);
        if (m) {
          const id = Number(m[1]);
          // attempt to find by id after refreshing
          const refreshed = await fetchTags();
          const byId = refreshed.find(t => t.id === id);
          if (byId) return byId;
          // if not found, create a minimal tag entry so UI can proceed
          const constructed = { id, name };
          setTags(prev => [...prev, constructed]);
          return constructed as Tag;
        }
      }

      throw new Error('Unable to determine created tag id or object after POST /tags');
    } catch (error) {
      console.error('Failed to create tag:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    // simple confirm to avoid accidental deletes
   
    try {
      await makeRequest(`/tasks/${taskId}`, { method: 'DELETE' });
      // remove locally
      setTasks(prev => prev.filter(t => t.id !== taskId));
      if (expandedTask === taskId) setExpandedTask(null);
      if (editingTask === taskId) setEditingTask(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const isExpanded = expandedTask === task.id;
    const isEditing = editingTask === task.id;
    
    return (
      <Card 
        sx={{ 
          mb: 1, 
          border: `2px solid ${getPriorityColor(task.priority)}`,
          borderRadius: 2
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
              {/* Removed XP Chip visual as requested */}
              
              {/* Delete button (stopPropagation so parent onClick won't toggle) */}
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTask(task.id);
                }}
                aria-label="delete task"
              >
                <DeleteIcon />
              </IconButton>

            
              <IconButton size="small">
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