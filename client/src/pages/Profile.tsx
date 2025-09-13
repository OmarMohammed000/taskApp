import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Stack,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { useUser } from "../context/UserContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Profile() {
  const { user, stats, fetchUser } = useUser();
  const { makeRequest, logout } = useAuth();
  const navigate = useNavigate();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity?: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
    }
  }, [user]);

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">No user found</Typography>
          <Typography variant="body2">Please sign in to view your profile.</Typography>
        </Paper>
      </Box>
    );
  }

  const handleOpenConfirm = () => setConfirmOpen(true);
  const handleCloseConfirm = () => setConfirmOpen(false);

  const handleDelete = async () => {
    setError(null);
    setLoading(true);
    try {
      await makeRequest(`/users/${user.id}`, { method: "DELETE" });
      // on successful deletion, log out and redirect to login
      logout();
      navigate("/login");
    } catch (err) {
      console.error("Delete account error:", err);
      setError("Failed to delete account. Try again.");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  const validateEmail = (e: string) => {
    // simple email validation
    return /^\S+@\S+\.\S+$/.test(e);
  };

  const handleStartEdit = () => {
    setEditMode(true);
    setName(user.name ?? "");
    setEmail(user.email ?? "");
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setName(user.name ?? "");
    setEmail(user.email ?? "");
    setError(null);
  };

  const handleSave = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }
    if (!validateEmail(email)) {
      setError("Invalid email");
      return;
    }
    setSaving(true);
    try {
      await makeRequest("/users", {
        method: "PUT",
        data: { name: name.trim(), email: email.trim() },
      });
      // refresh user data from server
      await fetchUser();
      setEditMode(false);
      setSnack({ open: true, message: "Profile updated", severity: "success" });
    } catch (err: any) {
      console.error("Update user error:", err);
      const msg = err?.response?.data?.message ?? "Failed to update profile";
      setError(msg);
      setSnack({ open: true, message: msg, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <Navbar></Navbar>
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 900, margin: "0 auto" }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Avatar sx={{ width: 72, height: 72, bgcolor: "primary.main", fontSize: 28 }}>
            {user.name?.charAt(0)?.toUpperCase() ?? "U"}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            {!editMode ? (
              <>
                <Typography variant="h5">{user.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </>
            ) : (
              <>
                <TextField
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  sx={{ mb: 1 }}
                />
                <TextField
                  label="Email"
                  value={email}
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                />
              </>
            )}
          </Box>
          <Box>
            {!editMode ? (
              <Button variant="outlined" onClick={handleStartEdit}>
                Edit
              </Button>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={handleCancelEdit} disabled={saving}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleSave} disabled={saving}>
                  {saving ? <CircularProgress size={20} /> : "Save"}
                </Button>
              </Stack>
            )}
          </Box>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="h6" sx={{ mb: 1 }}>
          Stats
        </Typography>
        <List>
          <ListItem>
            <ListItemAvatar>
              <Avatar>XP</Avatar>
            </ListItemAvatar>
            <ListItemText primary="XP" secondary={stats?.xp ?? user.xp} />
          </ListItem>

          <ListItem>
            <ListItemAvatar>
              <Avatar>Lv</Avatar>
            </ListItemAvatar>
            <ListItemText primary="Level" secondary={stats?.level_number ?? user.level_number ?? "-"} />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" sx={{ mb: 1 }}>
          Account
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="User ID" secondary={user.id} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Email" secondary={user.email} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Name" secondary={user.name} />
          </ListItem>
        </List>

        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            color="error"
            onClick={handleOpenConfirm}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Delete Account"}
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Dialog open={confirmOpen} onClose={handleCloseConfirm}>
          <DialogTitle>Delete account</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Deleting your account is irreversible. All your data (tasks, tags, progress) will be removed.
              Are you sure you want to continue?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirm} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleDelete} color="error" disabled={loading} autoFocus>
              {loading ? <CircularProgress size={18} color="inherit" /> : "Yes, delete"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snack.open}
          autoHideDuration={3000}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          <Alert severity={snack.severity} sx={{ width: "100%" }}>
            {snack.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
    </>
  );
}