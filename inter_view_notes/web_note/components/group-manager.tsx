"use client";

import { useState } from "react";
import type { RoutineGroup } from "./admin-types";

export function GroupManager({
  groups,
  onCreate,
  onUpdate,
  onDelete,
}: {
  groups: RoutineGroup[];
  onCreate: (data: Partial<RoutineGroup>) => void;
  onUpdate: (id: string, data: Partial<RoutineGroup>) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  return (
    <div className="card admin-section">
      <div className="section-header">
        <h2>Groups ({groups.length})</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim()) return;
            onCreate({
              id: `group-${Date.now()}`,
              title,
              subtitle: "",
              sort_order: groups.length,
            });
            setTitle("");
          }}
          className="inline-form"
        >
          <input
            type="text"
            placeholder="New group title..."
            value={title}
            onChange={(event) => setTitle(event.target.value)}
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
            {editing === group.id ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  onUpdate(group.id, { title });
                  setEditing(null);
                  setTitle("");
                }}
                className="inline-form"
              >
                <input
                  type="text"
                  defaultValue={group.title}
                  onChange={(event) => setTitle(event.target.value)}
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
                    setEditing(null);
                    setTitle("");
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
                      setEditing(group.id);
                      setTitle(group.title);
                    }}
                    style={{ padding: "6px 12px", fontSize: "12px" }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn danger"
                    onClick={() => onDelete(group.id)}
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
  );
}
