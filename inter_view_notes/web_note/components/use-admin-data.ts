import { useCallback, useEffect, useState } from "react";
import type { RoutineGroup, RoutineTopic, User } from "./admin-types";

type AdminTab = "users" | "routine";

async function request(path: string, init?: RequestInit) {
  const response = await fetch(path, init);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Request failed");
  return body;
}

export function useAdminData(activeTab: AdminTab) {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<RoutineGroup[]>([]);
  const [topics, setTopics] = useState<RoutineTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      if (activeTab === "users") {
        const body = await request("/api/admin/users");
        setUsers(body.users || []);
      } else {
        const body = await request("/api/admin/routine");
        setGroups(body.groups || []);
        setTopics(body.topics || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const run = useCallback(
    async (path: string, init: RequestInit, fallback: string) => {
      try {
        setError("");
        await request(path, init);
        await loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : fallback);
      }
    },
    [loadData],
  );

  const updateUserRole = (id: string, role: User["role"]) =>
    run(
      "/api/admin/users",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role }),
      },
      "Failed to update user",
    );

  const deleteUser = (id: string) =>
    run(
      `/api/admin/users?id=${encodeURIComponent(id)}`,
      { method: "DELETE" },
      "Failed to delete user",
    );

  const createGroup = (data: Partial<RoutineGroup>) =>
    run(
      "/api/admin/routine",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "group", data }),
      },
      "Failed to create group",
    );

  const updateGroup = (id: string, data: Partial<RoutineGroup>) =>
    run(
      "/api/admin/routine",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "group", id, data }),
      },
      "Failed to update group",
    );

  const deleteGroup = (id: string) =>
    run(
      `/api/admin/routine?type=group&id=${encodeURIComponent(id)}`,
      { method: "DELETE" },
      "Failed to delete group",
    );

  const createTopic = (data: Partial<RoutineTopic>) =>
    run(
      "/api/admin/routine",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "topic", data }),
      },
      "Failed to create topic",
    );

  const updateTopic = (id: string, data: Partial<RoutineTopic>) =>
    run(
      "/api/admin/routine",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "topic", id, data }),
      },
      "Failed to update topic",
    );

  const deleteTopic = (id: string) =>
    run(
      `/api/admin/routine?type=topic&id=${encodeURIComponent(id)}`,
      { method: "DELETE" },
      "Failed to delete topic",
    );

  return {
    users,
    groups,
    topics,
    loading,
    error,
    updateUserRole,
    deleteUser,
    createGroup,
    updateGroup,
    deleteGroup,
    createTopic,
    updateTopic,
    deleteTopic,
  };
}
