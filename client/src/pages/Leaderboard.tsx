import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import Navbar from "../components/Navbar";

interface LeaderRow {
  id: number;
  name: string;
  xp: number;
  level_number?: number;
}

export default function Leaderboard() {
  const { socket } = useSocket();
  const { makeRequest } = useAuth();
  const { user } = useUser();
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await makeRequest("/users/leaderboard", { method: "GET" });
      // backend may return array or { leaderboard: [...] }
      const payload = response.data;
      if (Array.isArray(payload)) setRows(payload.slice(0, 10));
      else if (payload?.leaderboard && Array.isArray(payload.leaderboard)) setRows(payload.leaderboard.slice(0, 10));
      else setRows([]);
    } catch (err) {
      console.error(err);
      setError("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    
    const onLeaderboard = (data: any) => {
      if (!data) return;
      if (Array.isArray(data)) setRows(data.slice(0, 10));
      else if (data?.rankings && Array.isArray(data.rankings)) setRows(data.rankings.slice(0, 10));
    };
    // listen for socket updates
    if (!socket) return;
    socket.on("leaderboardUpdate", onLeaderboard);
    console.log("updated leaderboard via socket");
    return () => {
      socket.off("leaderboardUpdate", onLeaderboard);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return (
    <>
    <Navbar></Navbar>
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2, maxWidth: 900, margin: "0 auto" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Leaderboard — Top 10
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <TableContainer>
            <Table size="small" aria-label="leaderboard table">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Player</TableCell>
                  <TableCell align="right">Level</TableCell>
                  <TableCell align="right">XP</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r, i) => {
                  const isSelf = user && r.id === user.id;
                  return (
                    <TableRow
                      key={r.id}
                      sx={{
                        backgroundColor: isSelf ? "rgba(63,81,181,0.08)" : "transparent",
                        fontWeight: isSelf ? "bold" : "normal",
                      }}
                    >
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell align="right">{r.level_number ?? "—"}</TableCell>
                      <TableCell align="right">{r.xp}</TableCell>
                    </TableRow>
                  );
                })}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No leaderboard data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
    </>
  );
}