import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';
import Alert from '../components/Alert.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { errorMessage } from '../services/api.js';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);

  async function submit(event) {
    event.preventDefault(); setError(''); setSubmitting(true);
    try { await register(form); navigate('/'); } catch (err) { setError(errorMessage(err)); } finally { setSubmitting(false); }
  }

  return (
    <div className="auth-page">
      <section className="auth-visual register-visual"><div className="auth-brand"><ShieldCheck /> SecureDesk</div><div className="auth-message"><p className="eyebrow light">NOUVEAU COMPTE</p><h1>Un support simple,<br />dès le premier ticket.</h1><p>Votre compte sera créé avec le rôle Employé. Un administrateur peut ensuite modifier vos autorisations.</p></div></section>
      <section className="auth-panel"><form className="auth-card" onSubmit={submit}>
        <div><p className="eyebrow">INSCRIPTION</p><h2>Créer un compte</h2><p className="muted">Tous les champs sont obligatoires.</p></div>
        <Alert>{error}</Alert>
        <div className="form-grid two"><label className="field"><span>Prénom</span><div className="input-icon"><UserRound size={18} /><input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required minLength="2" /></div></label><label className="field"><span>Nom</span><div className="input-icon"><UserRound size={18} /><input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required minLength="2" /></div></label></div>
        <label className="field"><span>Adresse e-mail</span><div className="input-icon"><Mail size={18} /><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" /></div></label>
        <label className="field"><span>Mot de passe</span><div className="input-icon"><LockKeyhole size={18} /><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength="8" autoComplete="new-password" /></div><small>8 caractères minimum, avec majuscule, minuscule et chiffre.</small></label>
        <button className="button button-primary button-full" disabled={submitting}>{submitting ? 'Création…' : <>Créer mon compte <ArrowRight size={18} /></>}</button>
        <p className="auth-switch">Déjà inscrit ? <Link to="/connexion">Se connecter</Link></p>
      </form></section>
    </div>
  );
}
