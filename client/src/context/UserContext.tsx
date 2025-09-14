import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";

interface User {
  id: number;
  name: string;
  email: string;
  xp: number;
  isAdmin: boolean;
  level_id: number;
  level_number?: number;
}
interface UserStats {
  xp: number;
  level_number: number;
  required_xp: number;
  xp_to_next_level: number;
}
interface UserContextType {
  user: User | null;
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  updateProgress: (xpGained: 25 | 50) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { makeRequest, isAuthenticated } = useAuth();
  const { socket } = useSocket();

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await makeRequest("/users", { method: "GET" });
      // server returns user object directly
      setUser(response.data[0] as User);
      setError(null);
    } catch (err) {
      setError("Failed to fetch user");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (xpGained: 25 | 50) => {
    setLoading(true);
    setError(null);
    try {
      const response = await makeRequest("/users/progress", {
        method: "PATCH",
        data: { xpGained },
      });
      // expected shape: { message, user, stats }
      if (response.data.user) {
        setUser(response.data.user as User);
      }
      if (response.data.stats) {
        setStats(response.data.stats as UserStats);
      }
    } catch (err) {
      setError("Failed to update progress");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
      console.log("Fetching user data after auth");
    } else {
      setUser(null);
      setStats(null);
      setLoading(false);
    }
   
  }, [isAuthenticated]);

  useEffect(() => {
    if (!socket) return;

    const onUserProgress = (data: any) => {
      if (!data) return;
      if (data.user) setUser(data.user as User);
      if (data.stats) setStats(data.stats as UserStats);

      // handle stats-only shape
      if (data.xp !== undefined || data.level_number !== undefined) {
        setStats((prev) => ({
          xp: data.xp ?? prev?.xp ?? 0,
          level_number: data.level_number ?? prev?.level_number ?? 0,
          required_xp: data.required_xp ?? prev?.required_xp ?? 0,
          xp_to_next_level: data.xp_to_next_level ?? prev?.xp_to_next_level ?? 0,
        }));
        setUser((prev) => (prev ? { ...prev, xp: data.xp ?? prev.xp, level_id: data.level_id ?? prev.level_id } : prev));
      }
    };

    socket.on("userProgress", onUserProgress);
    return () => {
      socket.off("userProgress", onUserProgress);
    };
  }, [socket]);

  const value: UserContextType = {
    user,
    stats,
    loading,
    error,
    fetchUser,
    updateProgress,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};