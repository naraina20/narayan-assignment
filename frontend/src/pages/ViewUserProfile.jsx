import React from 'react';
import { useParams } from 'react-router-dom';

function ViewUserProfile() {
  const { userId } = useParams();

  // TODO: Fetch user data based on ID
  // useEffect(() => { axios.get(`/users/${userId}`) })

  return (
    <div className="container mt-5">
      <h2>Viewing User Profile</h2>
      <p>This will show public information of user ID: {userId}</p>
    </div>
  );
}

export default ViewUserProfile;
