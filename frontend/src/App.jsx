import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import UsersList from "./pages/UsersList";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorPage from "./pages/Error";
import GuestRoute from "./components/GuestRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar"
// wrapper

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<UsersList />} />
            <Route path="/me/:id" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
          </Route>
          <Route path="/error" element={<ErrorPage />} />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
