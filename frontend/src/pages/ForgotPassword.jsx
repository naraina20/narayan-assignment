// ForgotPasswordPage.jsx
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [submiting, setSubmiting] = useState(false);

  const onSubmit = async (data) => {
    try {
      setSubmiting(true)
      await axios.post('http://localhost:4000/api/auth/forgot-password', data);
      setSubmiting(false)
      toast.success('Password reset link sent to your email.');
    } catch (err) {
      setSubmiting(false)
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4 shadow">
            <h4 className="text-center mb-4">Forgot Password</h4>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3">
                <label className="form-label">Email</label>
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
              <div className='my-3'>
                <p>
                  <Link to="/login" className="text-primary fw-semibold">
                    Login
                  </Link>
                </p>
              </div>
              <button className="btn btn-primary w-100">Send Reset Link {submiting ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden='true'></span> : ''}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}