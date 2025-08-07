import { Routes, Route } from 'react-router-dom';
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

    {/* Wrap each main route with the Layout component */}
    <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
    <Route path="/tasks" element={<Layout><TaskListing /></Layout>} />
    <Route path="/tasks/create" element={<Layout><TaskCreation /></Layout>} />
    <Route path="/tasks/:id" element={<Layout><TaskDetails /></Layout>} />
    <Route path="/chat" element={<Layout><Chat /></Layout>} />
    <Route path="/profile" element={<Layout><Profile /></Layout>} />
    <Route path="/profile/:id" element={<Layout><Profile /></Layout>} />
    <Route path="/admin" element={<Layout><AdminPanel /></Layout>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;