import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ApplicationsPage from './pages/Applications';
import DashboardPage from './pages/Dashboard';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import NotFoundPage from './pages/NotFound';
import ProfilePage from './pages/Profile';
import RegisterPage from './pages/Register';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'applications', element: <ApplicationsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default router;
