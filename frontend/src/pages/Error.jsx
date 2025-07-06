import { useLocation } from 'react-router-dom';

export default function ErrorPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const message = queryParams.get('message') || 'Something went wrong.';
  const status = queryParams.get('status') || 500;

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4 text-center" style={{ maxWidth: '400px', width: '100%' }}>
        <h1 className="display-4 text-danger">{status}</h1>
        <p className="fs-5 text-muted">{message}</p>
        <a href="/" className="btn btn-primary mt-3">Go to Home</a>
      </div>
    </div>
  );
}
