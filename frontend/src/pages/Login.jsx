import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import Alert from '../components/Alert.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { errorMessage } from '../services/api.js';

const demos = [
  { label: 'Admin', email: 'admin@securedesk.local', password: 'Admin123!' },
  { label: 'Technicien', email: 'technicien@securedesk.local', password: 'Tech123!' },
  { label: 'Employé', email: 'employe@securedesk.local', password: 'Employe123!' },
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);

  async function submit(event) {
    event.preventDefault(); setError(''); setSubmitting(true);
    try { await login(form); navigate('/'); } catch (err) { setError(errorMessage(err)); } finally { setSubmitting(false); }
  }

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <div className="auth-brand"><ShieldCheck /> SecureDesk</div>
        <div className="auth-message"><p className="eyebrow light">SUPPORT INFORMATIQUE SÉCURISÉ</p><h1>Chaque incident.<br />Suivi. Protégé. Résolu.</h1><p>Une plateforme claire pour collaborer avec votre équipe informatique sans compromettre vos données.</p></div>
        <div className="auth-features"><span><CheckCircle2 /> Accès par rôles</span><span><CheckCircle2 /> Traçabilité complète</span><span><CheckCircle2 /> Données protégées</span></div>
      </section>
      <section className="auth-panel">
        <form className="auth-card" onSubmit={submit}>
          <div><p className="eyebrow">BIENVENUE</p><h2>Connectez-vous</h2><p className="muted">Accédez à votre espace de support.</p></div>
          <Alert>{error}</Alert>
          <label className="field"><span>Adresse e-mail</span><div className="input-icon"><Mail size={18} /><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nom@entreprise.ma" required autoComplete="email" /></div></label>
          <label className="field"><span>Mot de passe</span><div className="input-icon"><LockKeyhole size={18} /><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Votre mot de passe" required autoComplete="current-password" /></div></label>
          <button className="button button-primary button-full" disabled={submitting}>{submitting ? 'Connexion…' : <>Se connecter <ArrowRight size={18} /></>}</button>
          <div className="demo-box"><span>Comptes de démonstration</span><div className="demo-buttons">{demos.map((demo) => <button type="button" key={demo.label} onClick={() => setForm({ email: demo.email, password: demo.password })}>{demo.label}</button>)}</div></div>
          <p className="auth-switch">Pas encore de compte ? <Link to="/inscription">Créer un compte</Link></p>
        </form>
      </section>
    </div>
  );
}

