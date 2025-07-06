import { useForm } from 'react-hook-form';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [submiting, setSubmiting] = useState(false)

  const onSubmit = async (data) => {
    try {
      setSubmiting(true)
      const res = await axios.post('http://localhost:4000/api/auth/login', data, { withCredentials: true })
      console.log('login data ', res.data)
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      setSubmiting(false)
      toast.success('Login successful. Redirecting to Home page')
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setSubmiting(false)
      toast.error(err.response?.data?.message || 'Login failed.')
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow p-4">
            <h3 className="card-title text-center mb-4">Login</h3>

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

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  {...register('password', { required: 'Password is required' })}
                />
                {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
              </div>

              <div className='my-3'>
                <p>
                  <Link to="/forgot-password" className="text-primary fw-semibold">
                    Forgot password ?
                  </Link>
                </p>
              </div>

              <button type="submit" className="btn btn-primary w-100">Login {submiting ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden='true'></span> : ''}</button>
            </form>
            <div className='my-3'>
              <p>
                Do not have any account?{" "}
                <Link to="/register" className="text-primary fw-semibold">
                  Go for Registration
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
