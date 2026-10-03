import { useEffect, useState } from 'react';
import { Search, ShieldCheck, UserCheck, UserX } from 'lucide-react';
import Alert from '../components/Alert.jsx';
import Badge from '../components/Badge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api, { errorMessage } from '../services/api.js';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      api.get(`/admin/users?search=${encodeURIComponent(search)}`).then(({ data }) => setUsers(data.data.users)).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  async function update(id, endpoint, body) {
    setError('');
    try {
      const { data } = await api.patch(`/admin/users/${id}/${endpoint}`, body);
      setUsers((items) => items.map((item) => item._id === id ? data.data.user : item));
    } catch (err) { setError(errorMessage(err)); }
  }

  return <div><PageHeader eyebrow="ADMINISTRATION" title="Utilisateurs et rôles" description="Contrôlez les autorisations et l’état des comptes." /><Alert>{error}</Alert><section className="panel filters-panel single"><div className="search-field"><Search size={18} /><input placeholder="Rechercher un utilisateur…" value={search} onChange={(e) => setSearch(e.target.value)} /></div></section><section className="panel table-panel">
    {loading ? <div className="panel-loader"><span className="loader" /></div> : users.length === 0 ? <EmptyState /> : <div className="table-scroll"><table><thead><tr><th>Utilisateur</th><th>Rôle</th><th>État</th><th>Dernière connexion</th><th>Action</th></tr></thead><tbody>{users.map((user) => { const own = user._id === currentUser._id; return <tr key={user._id}><td><div className="user-cell"><div className="avatar small">{user.firstName[0]}{user.lastName[0]}</div><div className="table-primary"><strong>{user.firstName} {user.lastName}</strong><span>{user.email}</span></div></div></td><td>{own ? <Badge value={user.role} /> : <select className="compact-select" value={user.role} onChange={(e) => update(user._id, 'role', { role: e.target.value })}><option value="employee">Employé</option><option value="technician">Technicien</option><option value="admin">Administrateur</option></select>}</td><td><span className={user.isActive ? 'status-active' : 'status-inactive'}>{user.isActive ? <><UserCheck size={15} /> Actif</> : <><UserX size={15} /> Désactivé</>}</span></td><td>{user.lastLogin ? new Date(user.lastLogin).toLocaleString('fr-FR') : 'Jamais'}</td><td>{!own && <button className="button button-small button-secondary" onClick={() => update(user._id, 'status', { isActive: !user.isActive })}>{user.isActive ? 'Désactiver' : 'Activer'}</button>}</td></tr>; })}</tbody></table></div>}
    <div className="security-note"><ShieldCheck size={18} /><span>Les changements de rôle et d’état sont automatiquement enregistrés dans le journal d’audit.</span></div>
  </section></div>;
}

