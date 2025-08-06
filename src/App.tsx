import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import TaskListing from '@/pages/TaskListing';
import TaskCreation from '@/pages/TaskCreation';
import TaskDetails from '@/pages/TaskDetails';
import Chat from '@/pages/Chat';
import Profile from '@/pages/Profile';
import AdminPanel from '@/pages/AdminPanel';
import NotFound from '@/pages/NotFound';

const App = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/tasks"
      element={
        <ProtectedRoute>
          <Layout>
            <TaskListing />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/tasks/create"
      element={
        <ProtectedRoute>
          <Layout>
            <TaskCreation />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/tasks/:id"
      element={
        <ProtectedRoute>
          <Layout>
            <TaskDetails />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/chat"
      element={
        <ProtectedRoute>
          <Layout>
            <Chat />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile/:id"
      element={
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin"
      element={
        <ProtectedRoute>
          <Layout>
            <AdminPanel />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;