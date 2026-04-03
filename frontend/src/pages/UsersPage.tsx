import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import api from "../lib/api";
import { User } from "../types";

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);

  const loadUsers = async () => {
    const response = await api.get("/users");
    setUsers(response.data.data);
  };

  const updateRole = async (id: number, role: User["role"]) => {
    await api.patch(`/users/${id}/role`, { role });
    void loadUsers();
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Users"
        title="Access control and role management"
        description="Admin-only management for the people operating inside PulseWatch."
      />
      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select value={user.role} onChange={(event) => void updateRole(user.id, event.target.value as User["role"])}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};
