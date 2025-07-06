import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {toast } from 'react-toastify';
import api from '../utils/axios';
import { useNavigate } from "react-router-dom";



function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function UsersList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [offset, setOffset] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(20);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'user', isVerified: false });
  const [processing, setProcessing] = useState({});
  const navigate = useNavigate();
  

  const debouncedSearch = useDebounce(search, 300);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/user/list?page=${page}&search=${debouncedSearch}&limit=${limit}`)
      setUsers(response.data.users || []);
      setTotalPages(response.data.totalPages || 1);
      setOffset(response.data.offset)
    } catch (error) {
      setError('Failed to fetch users. Please try again later.');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getInitial = (name) => {
    if (!name || typeof name !== 'string') return 'NA';
    const words = name.split(' ');
    const initials = words.slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
    return initials || 'NA';
  };


  const handleEditClick = useCallback((user) => {
    setEditUser(user);
    setFormData({
      id : user.id || 0,
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
      isVerified: user.isVerified || false,
    });
  }, []);

  const handleFormChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleLimitChange = useCallback((e) => {
    const newLimit = parseInt(e.target.value);
    setLimit(newLimit);
    setPage(1);
  }, []);

  const handleUpdate = useCallback(async (e) => {
    e.preventDefault();
    setProcessing(prev => ({ ...prev, [editUser.id]: true }));
    if (!editUser) return;
    try {
      if(JSON.parse(localStorage.getItem('user'))?.id == editUser.id){
        var response = await api.put(`/api/user/me/${editUser.id}`, formData);
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }else{
        var response = await api.put(`/api/user/edit-user/${editUser.id}`, formData);
      }
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === editUser.id ? { ...user, ...response.data.user } : user
        )
      );
      setEditUser(null);
      setError(null);

      const closeButton = document.querySelector('#editUserModal .btn-close');
      if (closeButton) {
        closeButton.click();
      } else {
        console.warn('Close button not found');
        const modalElement = document.getElementById('editUserModal');
        if (modalElement) {
          modalElement.classList.remove('show');
          modalElement.style.display = 'none';
          const backdrops = document.querySelectorAll('.modal-backdrop');
          backdrops.forEach(backdrop => backdrop.remove());
          document.body.classList.remove('modal-open');
          document.body.style.removeProperty('overflow');
          document.body.style.removeProperty('padding-right');
        }
      }
      toast.success('User updated successfully!');
    } catch (error) {
      setError('Failed to update user. Please try again.');
      console.error('Error updating user:', error);
      toast.error('Failed to update user. Please try again.');
    } finally {
      setProcessing(prev => ({ ...prev, [editUser.id]: false }));
    }
  }, [editUser, formData]);


  const handleDelete = useCallback(async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setProcessing(prev => ({ ...prev, [userId]: true }));
    try {
      await api.delete(`/api/user/delete/${userId}`);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      toast.success('User deleted successfully!');
      if(JSON.parse(localStorage.getItem('user'))?.id == userId){
        localStorage.clear()
        await api.get('/api/auth/logout')
        navigate('/login')
      }
    } catch (error) {
      setError('Failed to delete user. Please try again.');
      toast.error('Failed to delete user. Please try again.');
      console.error('Error deleting user:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [userId]: false }));
    }
  }, []);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const tableContent = useMemo(() => (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th scope="col">Sr No</th>
            <th scope="col">Profile Image</th>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Role</th>
            <th scope="col">Verified</th>
            <th scope="col">Created At</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user,i) => (
              <tr  key={user.id} >
                <td onClick={() => navigate(`/me/${user.id}`)} style={{ cursor: 'pointer' }}>{i+offset+1}</td>
                <td onClick={() => navigate(`/me/${user.id}`)} style={{ cursor: 'pointer' }}>
                  <div style={{ width: '50px', height: '50px' }}>
                    {user.profileImage ? (
                      <>
                        <img
                          src={`${import.meta.env.VITE_BASE_BACKEND_URL}/images/${user.profileImage}`}
                          alt={`${user.name || 'User'}'s profile`}
                          className="img-thumbnail rounded-circle object-fit-contain"
                          style={{ width: '50px', height: '50px', objectFit: 'cover', display: 'block' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        {!user.profileImage ? <div
                          className="d-flex align-items-center justify-content-center rounded-circle bg-secondary text-white"
                          style={{
                            width: '50px',
                            height: '50px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            display: 'none',
                          }}
                        >
                          {getInitial(user.name)}
                        </div> : ''}
                      </>
                    ) : (
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle bg-secondary text-white"
                        style={{
                          width: '50px',
                          height: '50px',
                          fontSize: '18px',
                          fontWeight: 'bold',
                        }}
                      >
                        {getInitial(user.name)}
                      </div>
                    )}
                  </div>
                </td>
                <td onClick={() => navigate(`/me/${user.id}`)} style={{ cursor: 'pointer' }}>{user.name}</td>
                <td onClick={() => navigate(`/me/${user.id}`)} style={{ cursor: 'pointer' }}>{user.email}</td>
                <td onClick={() => navigate(`/me/${user.id}`)} style={{ cursor: 'pointer' }}>{user.role}</td>
                <td onClick={() => navigate(`/me/${user.id}`)} style={{ cursor: 'pointer' }}>
                  <span
                    className={`badge ${user.isVerified ? 'bg-success' : 'bg-warning'}`}
                  >
                    {user.isVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </td>
                <td onClick={() => navigate(`/me/${user.id}`)} style={{ cursor: 'pointer' }}>
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td>

                  {JSON.parse(localStorage.getItem('user'))?.id == user.id || JSON.parse(localStorage.getItem('user'))?.role == 'admin' ? <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleEditClick(user)}
                    disabled={loading || processing[user.id]}
                    data-bs-toggle="modal"
                    data-bs-target="#editUserModal"
                  >
                    Edit
                  </button>: ''}
                  {JSON.parse(localStorage.getItem('user'))?.role == 'admin'||JSON.parse(localStorage.getItem('user'))?.id == user.id ? <button
                    className="btn btn-sm btn-outline-danger my-1"
                    onClick={() => handleDelete(user.id)}
                    disabled={loading || processing[user.id]}
                  >
                    Delete
                    {processing[users.id] ? (
                      <span className="spinner-border spinner-border-sm ms-1" role="status" aria-hidden="true"></span>
                    ) : (
                      ''
                    )}
                  </button>: ''}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
                No users found matching your search criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  ), [users, loading, handleDelete]);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">All Users</h2>
      <div className="row mb-3">
        <div>
          <input
            className="form-control"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
          />
        </div>

      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {tableContent}

      {totalPages >= 1 && (
        <div className='d-flex justify-content-between'>
          <div>
            <select
              className="form-select"
              value={limit}
              onChange={handleLimitChange}
              disabled={loading}
            >
              <option selected value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${page === 1 || loading ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1 || loading}
                >
                  Previous
                </button>
              </li>
              {[...Array(totalPages).keys()].map((index) => (
                <li
                  key={index + 1}
                  className={`page-item ${page === index + 1 ? 'active' : ''}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(index + 1)}
                    disabled={loading}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${page === totalPages || loading || totalPages === 0 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages || loading || totalPages === 0}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>

      )}


      <div className="modal fade" id="editUserModal" tabIndex="-1" aria-labelledby="editUserModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editUserModalLabel">Edit User</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {JSON.parse(localStorage.getItem('user'))?.id == formData.id ? <div className="mb-3">
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                />
              </div> : ''}
              <div className="mb-3">
                <label htmlFor="role" className="form-label">Role</label>
                <select
                  className="form-select"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary" onClick={handleUpdate}>Save changes
                {processing[users.id] ? (
                  <span className="spinner-border spinner-border-sm ms-1" role="status" aria-hidden="true"></span>
                ) : (
                  ''
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}

export default UsersList;