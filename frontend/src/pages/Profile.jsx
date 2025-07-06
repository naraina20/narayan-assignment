// ProfilePage.jsx
import { useEffect, useState } from 'react';
import api from '../utils/axios';
import { useParams } from 'react-router-dom';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams()

  const getInitial = (name) => {
    if (!name || typeof name !== 'string') return 'NA';
    const words = name.split(' ');
    const initials = words.slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
    return initials || 'NA';
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (JSON.parse(localStorage.getItem('user'))?.id == id) {
          const user = JSON.parse(localStorage.getItem('user'))
          user['isVerified'] = true
          setUser(user)
        } else {
          const res = await api.get(`/api/user/me/${id}`);
          setUser(res.data);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if(!user){
    return <div className="text-center mt-5 text-danger"><h4>User profile not found.</h4></div>
  }

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h3 className="mb-3">My Profile</h3>
        { !loading ? <div className="row">
          <div className="col-md-4 text-center">
            <img
              src={user.profileImage ? `${import.meta.env.VITE_BASE_BACKEND_URL}/images/${user.profileImage}` : '/profile.png'}
              alt="Profile"
              className="img-thumbnail rounded-circle"
              width={150}
              height={150}
              loading='lazy'
            />
          </div>
          <div className="col-md-8">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role?.charAt(0).toUpperCase() + user.role.slice(1)}</p>
            <p><strong>Verified:</strong> {user.isVerified ? 'Yes' : 'No'}</p>
          </div>
        </div>:  <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="spinner-border" role="status">
        </div>
      </div>}
      </div>
    </div>
  );
}
