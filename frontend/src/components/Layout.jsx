import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Activity, ClipboardList, FilePlus2, LayoutDashboard, LogOut, Menu, ScrollText,
  ShieldCheck, UserCircle, Users, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { label } from './Badge.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  const items = [
    { to: '/', icon: LayoutDashboard, text: 'Tableau de bord', end: true },
    { to: '/tickets', icon: ClipboardList, text: 'Tickets' },
    ...(['employee', 'admin'].includes(user.role) ? [{ to: '/tickets/nouveau', icon: FilePlus2, text: 'Nouveau ticket' }] : []),
    ...(user.role === 'admin' ? [
      { to: '/utilisateurs', icon: Users, text: 'Utilisateurs' },
      { to: '/journaux', icon: ScrollText, text: 'Journal d’audit' },
    ] : []),
    { to: '/profil', icon: UserCircle, text: 'Mon profil' },
  ];

  async function handleLogout() {
    await logout();
    navigate('/connexion');
  }

  return (
    <div className="app-shell">
      <button className="mobile-menu" onClick={() => setOpen(true)} aria-label="Ouvrir le menu"><Menu /></button>
      {open && <button className="sidebar-overlay" onClick={() => setOpen(false)} aria-label="Fermer le menu" />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand"><span className="brand-mark"><ShieldCheck /></span><span>SecureDesk<small>IT Support</small></span></div>
        <button className="sidebar-close" onClick={() => setOpen(false)} aria-label="Fermer"><X /></button>
        <nav className="nav-list">
          <p className="nav-label">ESPACE DE TRAVAIL</p>
          {items.map(({ to, icon: Icon, text, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Icon size={19} /><span>{text}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-security"><Activity size={17} /><div><strong>Protection active</strong><span>Session et API sécurisées</span></div></div>
        <div className="sidebar-user">
          <div className="avatar">{initials}</div>
          <div className="sidebar-user-copy"><strong>{user.firstName} {user.lastName}</strong><span>{label(user.role)}</span></div>
          <button className="icon-button" onClick={handleLogout} title="Se déconnecter"><LogOut size={18} /></button>
        </div>
      </aside>
      <main className="main-content"><Outlet /></main>
    </div>
  );
}

