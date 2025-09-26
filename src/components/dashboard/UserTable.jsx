// src/components/dashboard/UserTable.jsx
import './styles/UserTable.css';

export default function UserTable({ users, onRoleChange }) {
  return (
    <div className="user-table">
      <h2>Usuarios</h2>
      <table>
        <thead>
          <tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Acción</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <select value={u.role} onChange={e => onRoleChange(u.id, e.target.value)}>
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
