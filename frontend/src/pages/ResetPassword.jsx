import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function ResetPasswordPage() {
  const { token } = useParams();
  console.log('token ', token)
  const navigate = useNavigate();
  const { register, handleSubmit, getValues, formState: { errors } } = useForm();
  const [submiting, setSubmiting] = useState(false);

  const onSubmit = async (data) => {
    try {
      setSubmiting(true)
      await axios.post(`http://localhost:4000/api/auth/reset-password/${token}`, data);
      setSubmiting(false)
      toast.success('Password has been reset. You can now log in.');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setSubmiting(false)
      toast.error(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4 shadow">
            <h4 className="text-center mb-4">Reset Password</h4>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                />
                {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  {...register('confirmPassword', {
                    required: 'Confirm Password is required',
                    validate: value => value === getValues('password') || 'Passwords do not match'
                  })}
                />
                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
              </div>
              <button className="btn btn-success w-100">Reset Password {submiting ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden='true'></span> : ''}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
