import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Eye, Plus, Search } from 'lucide-react';
import Alert from '../components/Alert.jsx';
import Badge, { label } from '../components/Badge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api, { errorMessage } from '../services/api.js';

export default function Tickets() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', page: 1 });
  const [result, setResult] = useState({ tickets: [], pagination: { page: 1, pages: 1, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true); setError('');
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
        const { data } = await api.get(`/tickets?${params}`);
        setResult(data.data);
      } catch (err) { setError(errorMessage(err)); } finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(timer);
  }, [filters]);

  const changeFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: key === 'page' ? value : 1 }));
  return (
    <div>
      <PageHeader eyebrow="INCIDENTS" title="Gestion des tickets" description={`${result.pagination.total} ticket(s) accessible(s) selon votre rôle.`}
        actions={['employee', 'admin'].includes(user.role) && <Link to="/tickets/nouveau" className="button button-primary"><Plus size={18} /> Créer un ticket</Link>} />
      <Alert>{error}</Alert>
      <section className="panel filters-panel"><div className="search-field"><Search size={18} /><input placeholder="Rechercher par titre ou numéro…" value={filters.search} onChange={(e) => changeFilter('search', e.target.value)} /></div><select value={filters.status} onChange={(e) => changeFilter('status', e.target.value)}><option value="">Tous les statuts</option><option value="open">Ouvert</option><option value="in_progress">En cours</option><option value="resolved">Résolu</option><option value="closed">Fermé</option></select><select value={filters.priority} onChange={(e) => changeFilter('priority', e.target.value)}><option value="">Toutes les priorités</option><option value="urgent">Urgente</option><option value="high">Haute</option><option value="medium">Moyenne</option><option value="low">Faible</option></select></section>
      <section className="panel table-panel">
        {loading ? <div className="panel-loader"><span className="loader" /></div> : result.tickets.length === 0 ? <EmptyState title="Aucun ticket trouvé" text="Modifiez les filtres ou créez une nouvelle demande." /> : <div className="table-scroll"><table><thead><tr><th>Ticket</th><th>Catégorie</th><th>Priorité</th><th>Statut</th><th>Responsable</th><th>Date</th><th /></tr></thead><tbody>{result.tickets.map((ticket) => <tr key={ticket._id}><td><div className="table-primary"><strong>{ticket.title}</strong><span>{ticket.code}</span></div></td><td>{label(ticket.category)}</td><td><Badge value={ticket.priority} /></td><td><Badge value={ticket.status} /></td><td>{ticket.assignedTo ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : <span className="muted">Non attribué</span>}</td><td>{new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</td><td><Link className="icon-button" to={`/tickets/${ticket._id}`} title="Consulter"><Eye size={18} /></Link></td></tr>)}</tbody></table></div>}
        {result.pagination.pages > 1 && <div className="pagination"><button className="icon-button" disabled={filters.page <= 1} onClick={() => changeFilter('page', filters.page - 1)}><ChevronLeft /></button><span>Page {result.pagination.page} sur {result.pagination.pages}</span><button className="icon-button" disabled={filters.page >= result.pagination.pages} onClick={() => changeFilter('page', filters.page + 1)}><ChevronRight /></button></div>}
      </section>
    </div>
  );
}

