"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  created_at: string;
};

type RoutineGroup = {
  id: string;
  title: string;
  subtitle: string;
  sort_order: number;
};

type RoutineTopic = {
  id: string;
  group_id: string;
  title: string;
  hint: string;
  sort_order: number;
};

export function AdminPanel({ adminEmail }: { adminEmail: string }) {
  const [activeTab, setActiveTab] = useState<"users" | "routine">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<RoutineGroup[]>([]);
  const [topics, setTopics] = useState<RoutineTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    try {
      setError("");
      setLoading(true);

      if (activeTab === "users") {
        const response = await fetch("/api/admin/users");
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Failed to load users");
        setUsers(body.users || []);
      } else {
        const response = await fetch("/api/admin/routine");
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Failed to load routine");
        setGroups(body.groups || []);
        setTopics(body.topics || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function updateUserRole(userId: string, newRole: "admin" | "user") {
    try {
      setError("");
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Failed to update user");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    }
  }

  async function deleteUser(userId: string) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      setError("");
      const response = await fetch(`/api/admin/users?id=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Failed to delete user");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  }

  async function createGroup(data: Partial<RoutineGroup>) {
    try {
      setError("");
      const response = await fetch("/api/admin/routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "group", data }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Failed to create group");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group");
    }
  }

  async function updateGroup(id: string, data: Partial<RoutineGroup>) {
    try {
      setError("");
      const response = await fetch("/api/admin/routine", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "group", id, data }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Failed to update group");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update group");
    }
  }

  async function deleteGroup(id: string) {
    if (!window.confirm("Are you sure? This will delete all topics in this group.")) return;
    try {
      setError("");
      const response = await fetch(`/api/admin/routine?type=group&id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Failed to delete group");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete group");
    }
  }

  async function createTopic(data: Partial<RoutineTopic>) {
    try {
      setError("");
      const response = await fetch("/api/admin/routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "topic", data }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Failed to create topic");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create topic");
    }
  }

  async function updateTopic(id: string, data: Partial<RoutineTopic>) {
    try {
      setError("");
      const response = await fetch("/api/admin/routine", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "topic", id, data }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Failed to update topic");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update topic");
    }
  }

  async function deleteTopic(id: string) {
    if (!window.confirm("Are you sure you want to delete this topic?")) return;
    try {
      setError("");
      const response = await fetch(`/api/admin/routine?type=topic&id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Failed to delete topic");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete topic");
    }
  }

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <span className="eyebrow">Admin workspace</span>
          <h1>Platform Management</h1>
          <p>Signed in as {adminEmail}. Manage users and learning content.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          className={`tab ${activeTab === "routine" ? "active" : ""}`}
          onClick={() => setActiveTab("routine")}
        >
          Routine & Tracks
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <div className="card empty-state">
          <p>Loading...</p>
        </div>
      ) : activeTab === "users" ? (
        <UsersTable
          users={users}
          onUpdateRole={updateUserRole}
          onDelete={deleteUser}
          adminEmail={adminEmail}
        />
      ) : (
        <RoutineManager
          groups={groups}
          topics={topics}
          onCreateGroup={createGroup}
          onUpdateGroup={updateGroup}
          onDeleteGroup={deleteGroup}
          onCreateTopic={createTopic}
          onUpdateTopic={updateTopic}
          onDeleteTopic={deleteTopic}
        />
      )}
    </section>
  );
}

function UsersTable({
  users,
  onUpdateRole,
  onDelete,
  adminEmail,
}: {
  users: User[];
  onUpdateRole: (id: string, role: "admin" | "user") => void;
  onDelete: (id: string) => void;
  adminEmail: string;
}) {
  return (
    <div className="card admin-table-container">
      <div className="table-header">
        <h2>Users ({users.length})</h2>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) => onUpdateRole(user.id, e.target.value as "admin" | "user")}
                  disabled={user.email === adminEmail}
                  className="role-select"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
              <td>
                {user.email !== adminEmail && (
                  <button
                    className="btn danger"
                    onClick={() => onDelete(user.id)}
                    style={{ padding: "6px 12px", fontSize: "12px" }}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RoutineManager({
  groups,
  topics,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onCreateTopic,
  onUpdateTopic,
  onDeleteTopic,
}: {
  groups: RoutineGroup[];
  topics: RoutineTopic[];
  onCreateGroup: (data: Partial<RoutineGroup>) => void;
  onUpdateGroup: (id: string, data: Partial<RoutineGroup>) => void;
  onDeleteGroup: (id: string) => void;
  onCreateTopic: (data: Partial<RoutineTopic>) => void;
  onUpdateTopic: (id: string, data: Partial<RoutineTopic>) => void;
  onDeleteTopic: (id: string) => void;
}) {
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [newGroupTitle, setNewGroupTitle] = useState("");
  const [newTopicTitle, setNewTopicTitle] = useState("");

  return (
    <div className="routine-manager">
      {/* Groups Section */}
      <div className="card admin-section">
        <div className="section-header">
          <h2>Groups ({groups.length})</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newGroupTitle.trim()) {
                onCreateGroup({
                  id: `group-${Date.now()}`,
                  title: newGroupTitle,
                  subtitle: "",
                  sort_order: groups.length,
                });
                setNewGroupTitle("");
              }
            }}
            className="inline-form"
          >
            <input
              type="text"
              placeholder="New group title..."
              value={newGroupTitle}
              onChange={(e) => setNewGroupTitle(e.target.value)}
              required
            />
            <button type="submit" className="btn primary">
              Add Group
            </button>
          </form>
        </div>
        <div className="groups-list">
          {groups.map((group) => (
            <div key={group.id} className="group-item">
              {editingGroup === group.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onUpdateGroup(group.id, { title: newGroupTitle });
                    setEditingGroup(null);
                    setNewGroupTitle("");
                  }}
                  className="inline-form"
                >
                  <input
                    type="text"
                    defaultValue={group.title}
                    onChange={(e) => setNewGroupTitle(e.target.value)}
                    required
                    autoFocus
                  />
                  <button type="submit" className="btn primary">
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setEditingGroup(null);
                      setNewGroupTitle("");
                    }}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <span className="group-title">{group.title}</span>
                  <div className="group-actions">
                    <button
                      className="btn"
                      onClick={() => {
                        setEditingGroup(group.id);
                        setNewGroupTitle(group.title);
                      }}
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn danger"
                      onClick={() => onDeleteGroup(group.id)}
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Topics Section */}
      <div className="card admin-section">
        <div className="section-header">
          <h2>Topics ({topics.length})</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newTopicTitle.trim() && groups.length > 0) {
                onCreateTopic({
                  id: `topic-${Date.now()}`,
                  group_id: groups[0].id,
                  title: newTopicTitle,
                  hint: "",
                  sort_order: topics.length,
                });
                setNewTopicTitle("");
              }
            }}
            className="inline-form"
          >
            <select
              value={groups[0]?.id || ""}
              onChange={(e) => {
                // Store selected group for topic creation
              }}
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="New topic title..."
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              required
            />
            <button type="submit" className="btn primary">
              Add Topic
            </button>
          </form>
        </div>
        <div className="topics-list">
          {topics.map((topic) => {
            const group = groups.find((g) => g.id === topic.group_id);
            return (
              <div key={topic.id} className="topic-item">
                {editingTopic === topic.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      onUpdateTopic(topic.id, { title: newTopicTitle });
                      setEditingTopic(null);
                      setNewTopicTitle("");
                    }}
                    className="inline-form"
                  >
                    <input
                      type="text"
                      defaultValue={topic.title}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      required
                      autoFocus
                    />
                    <button type="submit" className="btn primary">
                      Save
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        setEditingTopic(null);
                        setNewTopicTitle("");
                      }}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="topic-info">
                      <span className="topic-group">{group?.title || "Unknown"}</span>
                      <span className="topic-title">{topic.title}</span>
                    </div>
                    <div className="topic-actions">
                      <button
                        className="btn"
                        onClick={() => {
                          setEditingTopic(topic.id);
                          setNewTopicTitle(topic.title);
                        }}
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn danger"
                        onClick={() => onDeleteTopic(topic.id)}
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
