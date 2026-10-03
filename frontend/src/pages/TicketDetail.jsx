import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Download, MessageSquare, Send, Trash2, UserRound, Wrench } from 'lucide-react';
import Alert from '../components/Alert.jsx';
import Badge, { label } from '../components/Badge.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api, { errorMessage } from '../services/api.js';

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const requests = [api.get(`/tickets/${id}`), api.get(`/tickets/${id}/comments`)];
      if (user.role === 'admin') requests.push(api.get('/admin/technicians'));
      const [ticketResponse, commentsResponse, techResponse] = await Promise.all(requests);
      setTicket(ticketResponse.data.data.ticket);
      setComments(commentsResponse.data.data.comments);
      if (techResponse) setTechnicians(techResponse.data.data.technicians);
    } catch (err) { setError(errorMessage(err)); }
  }, [id, user.role]);
  useEffect(() => { load(); }, [load]);

  async function changeStatus(status) {
    setBusy(true); setError('');
    try { const { data } = await api.patch(`/tickets/${id}/status`, { status }); setTicket(data.data.ticket); }
    catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }
  async function assign(technicianId) {
    setBusy(true); setError('');
    try { const { data } = await api.patch(`/tickets/${id}/assign`, { technicianId: technicianId || null }); setTicket(data.data.ticket); }
    catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }
  async function addComment(event) {
    event.preventDefault(); if (!comment.trim()) return;
    setBusy(true); setError('');
    try { const { data } = await api.post(`/tickets/${id}/comments`, { content: comment }); setComments((items) => [...items, data.data.comment]); setComment(''); }
    catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }
  async function removeTicket() {
    if (!window.confirm('Supprimer définitivement ce ticket et ses commentaires ?')) return;
    try { await api.delete(`/tickets/${id}`); navigate('/tickets'); } catch (err) { setError(errorMessage(err)); }
  }

  if (!ticket && !error) return <div className="panel-loader full"><span className="loader" /></div>;
  if (!ticket) return <div><Alert>{error}</Alert><Link to="/tickets" className="button button-secondary"><ArrowLeft size={18} /> Retour aux tickets</Link></div>;
  return <div><PageHeader eyebrow={ticket.code} title={ticket.title} description={`Créé le ${new Date(ticket.createdAt).toLocaleString('fr-FR')}`} actions={<div className="header-actions"><Link to="/tickets" className="button button-secondary"><ArrowLeft size={18} /> Retour</Link>{user.role === 'admin' && <button className="button button-danger" onClick={removeTicket}><Trash2 size={18} /> Supprimer</button>}</div>} /><Alert>{error}</Alert>
    <div className="detail-grid"><div className="detail-main">
      <article className="panel ticket-description"><div className="panel-heading"><h2>Description de l’incident</h2><Badge value={ticket.status} /></div><p>{ticket.description}</p>{ticket.attachment && <a className="attachment" href={`/api/tickets/${ticket._id}/attachment`}><Download size={19} /><div><strong>{ticket.attachment.originalName}</strong><span>{Math.round(ticket.attachment.size / 1024)} Ko</span></div></a>}</article>
      <article className="panel comments-panel"><div className="panel-heading"><div><h2>Discussion</h2><p>{comments.length} commentaire(s)</p></div><MessageSquare /></div><div className="comments-list">{comments.length === 0 ? <p className="muted center">Aucun commentaire pour le moment.</p> : comments.map((item) => <div className="comment" key={item._id}><div className="avatar small">{item.author.firstName[0]}{item.author.lastName[0]}</div><div><div className="comment-head"><strong>{item.author.firstName} {item.author.lastName}</strong><span>{label(item.author.role)} · {new Date(item.createdAt).toLocaleString('fr-FR')}</span></div><p>{item.content}</p></div></div>)}</div><form className="comment-form" onSubmit={addComment}><textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Ajouter un commentaire…" maxLength="1000" rows="3" /><button className="button button-primary" disabled={busy || !comment.trim()}><Send size={17} /> Envoyer</button></form></article>
    </div><aside className="detail-side">
      <article className="panel info-panel"><h3>Informations</h3><dl><div><dt>Priorité</dt><dd><Badge value={ticket.priority} /></dd></div><div><dt>Catégorie</dt><dd>{label(ticket.category)}</dd></div><div><dt><UserRound size={16} /> Demandeur</dt><dd>{ticket.createdBy.firstName} {ticket.createdBy.lastName}</dd></div><div><dt><Wrench size={16} /> Technicien</dt><dd>{ticket.assignedTo ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : 'Non attribué'}</dd></div><div><dt><CalendarDays size={16} /> Mise à jour</dt><dd>{new Date(ticket.updatedAt).toLocaleString('fr-FR')}</dd></div></dl></article>
      {user.role === 'admin' && <article className="panel action-panel"><h3>Attribution</h3><label className="field"><span>Technicien responsable</span><select disabled={busy} value={ticket.assignedTo?._id || ''} onChange={(e) => assign(e.target.value)}><option value="">Non attribué</option>{technicians.map((tech) => <option key={tech._id} value={tech._id}>{tech.firstName} {tech.lastName}</option>)}</select></label></article>}
      {['technician', 'admin'].includes(user.role) && <article className="panel action-panel"><h3>Traitement</h3><label className="field"><span>Modifier le statut</span><select disabled={busy} value={ticket.status} onChange={(e) => changeStatus(e.target.value)}><option value="open">Ouvert</option><option value="in_progress">En cours</option><option value="resolved">Résolu</option><option value="closed">Fermé</option></select></label></article>}
    </aside></div>
  </div>;
}

