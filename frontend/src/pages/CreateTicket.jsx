import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileUp, Send } from 'lucide-react';
import Alert from '../components/Alert.jsx';
import PageHeader from '../components/PageHeader.jsx';
import api, { errorMessage } from '../services/api.js';

export default function CreateTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: 'software', priority: 'medium' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault(); setError(''); setSubmitting(true);
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    if (file) payload.append('attachment', file);
    try {
      const { data } = await api.post('/tickets', payload);
      navigate(`/tickets/${data.data.ticket._id}`);
    } catch (err) { setError(errorMessage(err)); } finally { setSubmitting(false); }
  }

  return <div className="narrow-page"><PageHeader eyebrow="NOUVEL INCIDENT" title="Créer un ticket" description="Décrivez clairement votre problème pour accélérer sa résolution." actions={<button className="button button-secondary" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Retour</button>} /><Alert>{error}</Alert><form className="panel form-panel" onSubmit={submit}>
    <label className="field"><span>Titre du problème</span><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex. Impossible d’accéder au réseau Wi-Fi" required minLength="5" maxLength="120" /></label>
    <label className="field"><span>Description détaillée</span><textarea rows="7" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Expliquez ce qui se passe, depuis quand et les messages affichés…" required minLength="10" maxLength="3000" /><small>{form.description.length}/3000 caractères</small></label>
    <div className="form-grid two"><label className="field"><span>Catégorie</span><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="hardware">Matériel</option><option value="software">Logiciel</option><option value="network">Réseau</option><option value="access">Accès et compte</option><option value="other">Autre</option></select></label><label className="field"><span>Priorité</span><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">Faible</option><option value="medium">Moyenne</option><option value="high">Haute</option><option value="urgent">Urgente</option></select></label></div>
    <label className="upload-zone"><FileUp /><strong>{file ? file.name : 'Ajouter une pièce jointe'}</strong><span>PDF, PNG, JPG ou TXT — 2 Mo maximum</span><input type="file" accept=".pdf,.png,.jpg,.jpeg,.txt" onChange={(e) => setFile(e.target.files[0] || null)} /></label>
    <div className="form-actions"><button className="button button-secondary" type="button" onClick={() => navigate(-1)}>Annuler</button><button className="button button-primary" disabled={submitting}>{submitting ? 'Envoi…' : <>Envoyer le ticket <Send size={18} /></>}</button></div>
  </form></div>;
}
