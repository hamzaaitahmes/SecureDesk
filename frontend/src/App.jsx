import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import CreateTicket from './pages/CreateTicket.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Logs from './pages/Logs.jsx';
import NotFound from './pages/NotFound.jsx';
import Profile from './pages/Profile.jsx';
import Register from './pages/Register.jsx';
import TicketDetail from './pages/TicketDetail.jsx';
import Tickets from './pages/Tickets.jsx';
import Users from './pages/Users.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="tickets" element={<Tickets />} />
              <Route path="tickets/:id" element={<TicketDetail />} />
              <Route path="profil" element={<Profile />} />
              <Route element={<ProtectedRoute roles={['employee', 'admin']} />}>
                <Route path="tickets/nouveau" element={<CreateTicket />} />
              </Route>
              <Route element={<ProtectedRoute roles={['admin']} />}>
                <Route path="utilisateurs" element={<Users />} />
                <Route path="journaux" element={<Logs />} />
              </Route>
            </Route>
          </Route>
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

