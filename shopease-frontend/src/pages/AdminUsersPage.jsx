import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await axiosInstance.get('/api/users');
        setUsers(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(
          err.response?.status === 401
            ? 'Please log in again.'
            : err.response?.status === 403
              ? 'Admin access is required.'
              : 'Could not load users. Check the backend and API URL.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    [user.id, user.name, user.email, user.role]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
  );

  return (
    <div className="main-content">
      <h1>User Management</h1>
      <p>View registered ShopEase users.</p>

      <input
        type="text"
        placeholder="Search users by name, email, ID or role..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p>Loading users...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && (
        <>
          <p>Total users: {users.length}</p>

          {filteredUsers.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', marginTop: '20px' }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name || '—'}</td>
                      <td>{user.email || '—'}</td>
                      <td>{user.role || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminUsersPage;