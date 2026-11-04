"use client";

import { useEffect, useState } from "react";
type Task = { id: string; title: string; hint: string };
type Group = { id: string; title: string; tasks: Task[] };
type RecordItem = { task_id: string; completed: boolean };
export function RoutinePanel() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/routine").then(async (response) => {
      const body = await response.json();
      if (!response.ok) return setError(body.error);
      setGroups(body.groups);
      setRecords(body.records);
    });
  }, []);
  async function toggle(taskId: string, completed: boolean) {
    setRecords((items) => [
      ...items.filter((item) => item.task_id !== taskId),
      { task_id: taskId, completed },
    ]);
    const response = await fetch("/api/routine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, completed }),
    });
    if (!response.ok) setError((await response.json()).error);
  }
  const state = new Map(
    records.map((record) => [record.task_id, record.completed]),
  );
  return (
    <section className="section">
      <div className="section-head">
        <div>
          <span className="eyebrow">Daily routine</span>
          <h1>Small steps, every day.</h1>
          <p className="sub">
            Check tasks as you complete them. Progress is saved securely to your account.
          </p>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="routine">
        {groups.map((group) => (
          <article className="routine-card card" key={group.id}>
            <h3>{group.title}</h3>
            {group.tasks.map((task) => (
              <label className="task" key={task.id}>
                <input
                  type="checkbox"
                  checked={state.get(task.id) ?? false}
                  onChange={(event) => toggle(task.id, event.target.checked)}
                />
                <span>
                  {task.title}
                  <small>{task.hint}</small>
                </span>
              </label>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
