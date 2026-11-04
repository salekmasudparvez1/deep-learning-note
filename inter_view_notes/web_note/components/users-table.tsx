"use client";

import type { User } from "./admin-types";

export function UsersTable({
  users,
  onUpdateRole,
  onDelete,
  adminEmail,
}: {
  users: User[];
  onUpdateRole: (id: string, role: User["role"]) => void;
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
                  onChange={(event) =>
                    onUpdateRole(user.id, event.target.value as User["role"])
                  }
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
