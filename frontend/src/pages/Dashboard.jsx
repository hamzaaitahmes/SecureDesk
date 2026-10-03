import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowUpRight, CheckCircle2, CircleDot, Clock3, Plus, TicketCheck } from 'lucide-react';
import Alert from '../components/Alert.jsx';
import Badge, { label } from '../components/Badge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api, { errorMessage } from '../services/api.js';

const cards = [
  { key: 'total', label: 'Total des tickets', icon: TicketCheck, tone: 'blue' },
  { key: 'open', label: 'Tickets ouverts', icon: CircleDot, tone: 'orange' },
  { key: 'in_progress', label: 'En cours', icon: Clock3, tone: 'purple' },
  { key: 'resolved', label: 'Tickets résolus', icon: CheckCircle2, tone: 'green' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/dashboard/stats').then(({ data }) => setStats(data.data)).catch((err) => setError(errorMessage(err))); }, []);
  const valueFor = (key) => key === 'total' ? stats?.total || 0 : stats?.status?.[key] || 0;
  const maxPriority = Math.max(...Object.values(stats?.priority || {}), 1);

  return (
    <div>
      <PageHeader eyebrow="VUE D’ENSEMBLE" title={`Bonjour ${user.firstName},`} description="Voici la situation de vos incidents informatiques aujourd’hui."
        actions={['employee', 'admin'].includes(user.role) && <Link className="button button-primary" to="/tickets/nouveau"><Plus size={18} /> Nouveau ticket</Link>} />
      <Alert>{error}</Alert>
      {!stats ? <div className="panel-loader"><span className="loader" /></div> : <>
        <section className="stat-grid">{cards.map(({ key, label: cardLabel, icon: Icon, tone }) => <article className="stat-card" key={key}><div className={`stat-icon tone-${tone}`}><Icon /></div><div><span>{cardLabel}</span><strong>{valueFor(key)}</strong></div></article>)}</section>
        <section className="dashboard-grid">
          <article className="panel">
            <div className="panel-heading"><div><h2>Tickets récents</h2><p>Les cinq dernières demandes accessibles</p></div><Link to="/tickets" className="text-link">Tout voir <ArrowUpRight size={16} /></Link></div>
            {stats.recentTickets.length === 0 ? <EmptyState title="Aucun ticket" text="Les nouveaux incidents apparaîtront ici." /> : <div className="recent-list">{stats.recentTickets.map((ticket) => <Link className="recent-item" key={ticket._id} to={`/tickets/${ticket._id}`}><div className="ticket-dot" /><div className="recent-main"><strong>{ticket.title}</strong><span>{ticket.code} · {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</span></div><Badge value={ticket.status} /></Link>)}</div>}
          </article>
          <article className="panel">
            <div className="panel-heading"><div><h2>Niveaux de priorité</h2><p>Répartition de la charge</p></div><AlertTriangle size={20} /></div>
            <div className="priority-chart">{['urgent', 'high', 'medium', 'low'].map((priority) => { const count = stats.priority?.[priority] || 0; return <div className="bar-row" key={priority}><div className="bar-label"><span>{label(priority)}</span><strong>{count}</strong></div><div className="bar-track"><span className={`bar-fill bar-${priority}`} style={{ width: `${(count / maxPriority) * 100}%` }} /></div></div>; })}</div>
          </article>
        </section>
      </>}
    </div>
  );
}

