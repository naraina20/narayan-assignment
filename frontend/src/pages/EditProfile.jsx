import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

function EditProfile() {
  const { register, handleSubmit } = useForm();
  const [preview, setPreview] = useState(null);

  const onSubmit = async (data) => {
    console.log('Updating profile with:', data);
    // TODO: Send updated data to backend
  };

  return (
    <div className="container mt-5">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
        <div className="mb-3">
          <label>Name</label>
          <input className="form-control" {...register("name")} />
        </div>

        <div className="mb-3">
          <label>Change Profile Image</label>
          <input type="file" className="form-control" {...register("profileImage")}
            onChange={(e) => setPreview(URL.createObjectURL(e.target.files[0]))} />
        </div>

        {preview && <img src={preview} alt="preview" width="100" />}

        <button className="btn btn-success">Save Changes</button>
      </form>
    </div>
  );
}

export default EditProfile;
