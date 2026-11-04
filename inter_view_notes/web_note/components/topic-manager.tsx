"use client";

import { useState } from "react";
import type { RoutineGroup, RoutineTopic } from "./admin-types";

export function TopicManager({
  groups,
  topics,
  onCreate,
  onUpdate,
  onDelete,
}: {
  groups: RoutineGroup[];
  topics: RoutineTopic[];
  onCreate: (data: Partial<RoutineTopic>) => void;
  onUpdate: (id: string, data: Partial<RoutineTopic>) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  return (
    <div className="card admin-section">
      <div className="section-header">
        <h2>Topics ({topics.length})</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim() || groups.length === 0) return;
            onCreate({
              id: `topic-${Date.now()}`,
              group_id: groups[0].id,
              title,
              hint: "",
              sort_order: topics.length,
            });
            setTitle("");
          }}
          className="inline-form"
        >
          <select value={groups[0]?.id || ""} onChange={() => {}}>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.title}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="New topic title..."
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <button type="submit" className="btn primary">
            Add Topic
          </button>
        </form>
      </div>
      <div className="topics-list">
        {topics.map((topic) => {
          const group = groups.find((item) => item.id === topic.group_id);
          return (
            <div key={topic.id} className="topic-item">
              {editing === topic.id ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    onUpdate(topic.id, { title });
                    setEditing(null);
                    setTitle("");
                  }}
                  className="inline-form"
                >
                  <input
                    type="text"
                    defaultValue={topic.title}
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
                  <div className="topic-info">
                    <span className="topic-group">
                      {group?.title || "Unknown"}
                    </span>
                    <span className="topic-title">{topic.title}</span>
                  </div>
                  <div className="topic-actions">
                    <button
                      className="btn"
                      onClick={() => {
                        setEditing(topic.id);
                        setTitle(topic.title);
                      }}
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn danger"
                      onClick={() => onDelete(topic.id)}
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
  );
}
