"use client";

import { useState } from "react";
import { RoutineManager } from "./routine-manager";
import { useAdminData } from "./use-admin-data";
import { UsersTable } from "./users-table";

type AdminTab = "users" | "routine";

export function AdminPanel({ adminEmail }: { adminEmail: string }) {
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const data = useAdminData(activeTab);

  return (
    <section className="section">
      <header className="section-head">
        <div>
          <span className="eyebrow">Admin workspace</span>
          <h1>Platform Management</h1>
          <p>Signed in as {adminEmail}. Manage users and learning content.</p>
        </div>
      </header>

      <nav className="admin-tabs">
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
      </nav>

      {data.error && <p className="error">{data.error}</p>}

      {data.loading ? (
        <div className="card empty-state">
          <p>Loading...</p>
        </div>
      ) : activeTab === "users" ? (
        <UsersTable
          users={data.users}
          onUpdateRole={data.updateUserRole}
          onDelete={data.deleteUser}
          adminEmail={adminEmail}
        />
      ) : (
        <RoutineManager
          groups={data.groups}
          topics={data.topics}
          onCreateGroup={data.createGroup}
          onUpdateGroup={data.updateGroup}
          onDeleteGroup={data.deleteGroup}
          onCreateTopic={data.createTopic}
          onUpdateTopic={data.updateTopic}
          onDeleteTopic={data.deleteTopic}
        />
      )}
    </section>
  );
}
