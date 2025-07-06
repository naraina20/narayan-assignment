import { useForm } from 'react-hook-form';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';




export default function RegisterPage() {
  const { register, handleSubmit,watch, formState: { errors } } = useForm();
  const [preview, setPreview] = useState(null);
  const [userCreated, setUserCreated] = useState(true);
  const [message, setMessage] = useState('');
  const [submiting, setSubmiting] = useState(false);

  const onSubmit = async (data) => {
    try {
      setSubmiting(true)
      const formData = new FormData();
      for (const key in data) {
        if (key === 'file') {
          if (data.file && data.file.length > 0) {
            formData.append('file', data.file[0]);
          }
        } else {
          formData.append(key, data[key]);
        }
      }

      const res = await axios.post('http://localhost:4000/api/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUserCreated(false)
      setSubmiting(false)
      toast.success(res.data.message ? res.data.message : "User created!");
    } catch (err) {
      setSubmiting(false)
      console.log("error at form submission ", err)
      toast.error(err.response?.data?.message || 'Registration failed.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            {userCreated ? (<div className="card-body">
              <h3 className="card-title text-center mb-4">Register</h3>
              <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
                <div className="mb-3">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Enter a valid email address'
                      }
                    })}

                  />
                  {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      },
                      maxLength: {
                        value: 20,
                        message: 'Password must not exceed 20 characters'
                      }
                    })}

                  />
                  {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm Password *</label>
                  <input
                    type="password"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    {...register('confirmPassword', {
                      required: 'Confirm Password is required',
                      validate: (value) => value === watch('password') || 'Passwords do not match'
                    })}
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback">{errors.confirmPassword.message}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label d-block">Select Role *</label>

                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      value="user"
                      id="roleUser"
                      {...register('role', { required: 'Role is required' })}
                    />
                    <label className="form-check-label" htmlFor="roleUser">User</label>
                  </div>

                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      value="admin"
                      id="roleAdmin"
                      {...register('role', { required: 'Role is required' })}
                    />
                    <label className="form-check-label" htmlFor="roleAdmin">Admin</label>
                  </div>

                  {errors.role && (
                    <div className="text-danger mt-1">{errors.role.message}</div>
                  )}
                </div>



                <div className="mb-3">
                  <label className="form-label">Profile Image</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    {...register('file')}
                    onChange={handleImageChange}
                  />
                  {preview && (
                    <div className="text-start mt-3">
                      <img
                        src={preview}
                        alt="Preview"
                        className="object-fit-contain"
                        width="100"
                        height="100"
                      />
                    </div>
                  )}
                </div>

                <button type="submit" className="btn btn-primary w-100">Register {submiting ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden='true'></span> : ''}</button>
              </form>
                <div className='my-3'>
              <p>
                Already have an account?{" "}
                <Link to="/Login" className="text-primary fw-semibold">
                  Go for Login
                </Link>
              </p>
            </div>
            </div>) : (
              <div className='d-flex flex-column align-items-center justify-content-center p-5'>
                <p>Registration successful. Please verify your email and log in with the same credentials.</p>
                <button onClick={() => window.location.reload()} className="btn btn-secondary mt-3">
                  Register another user
                </button>
              </div>
            )}
            
          </div>
          
        </div>
      </div>
    </div>
  );
}
