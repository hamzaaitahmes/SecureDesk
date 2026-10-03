import { useState } from 'react';
import { KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react';
import Alert from '../components/Alert.jsx';
import Badge from '../components/Badge.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api, { errorMessage } from '../services/api.js';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const initials = `${user.firstName[0]}${user.lastName[0]}`;
  async function submit(event) {
    event.preventDefault(); setError(''); setMessage('');
    if (form.newPassword !== form.confirm) return setError('Les nouveaux mots de passe ne correspondent pas.');
    try { const { data } = await api.put('/auth/password', { currentPassword: form.currentPassword, newPassword: form.newPassword }); setMessage(data.message); setForm({ currentPassword: '', newPassword: '', confirm: '' }); await refreshUser(); }
    catch (err) { setError(errorMessage(err)); }
  }
  return <div className="narrow-page"><PageHeader eyebrow="MON COMPTE" title="Profil et sécurité" description="Consultez vos informations et protégez votre accès." /><div className="profile-grid"><article className="panel profile-card"><div className="avatar profile-avatar">{initials}</div><h2>{user.firstName} {user.lastName}</h2><Badge value={user.role} /><div className="profile-info"><span><Mail size={17} /> {user.email}</span><span><UserRound size={17} /> Compte créé le {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span><span><ShieldCheck size={17} /> Compte {user.isActive ? 'actif' : 'désactivé'}</span></div></article><form className="panel form-panel" onSubmit={submit}><div className="panel-heading"><div><h2>Modifier le mot de passe</h2><p>Une nouvelle session sera créée automatiquement.</p></div><KeyRound /></div><Alert>{error}</Alert><Alert type="success">{message}</Alert><label className="field"><span>Mot de passe actuel</span><input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required /></label><label className="field"><span>Nouveau mot de passe</span><input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required minLength="8" /><small>Majuscule, minuscule et chiffre obligatoires.</small></label><label className="field"><span>Confirmer le mot de passe</span><input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required /></label><button className="button button-primary">Enregistrer le mot de passe</button></form></div></div>;
}

