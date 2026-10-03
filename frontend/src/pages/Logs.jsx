import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import Alert from '../components/Alert.jsx';
import Badge from '../components/Badge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import api, { errorMessage } from '../services/api.js';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => { setLoading(true); api.get(`/admin/logs?action=${encodeURIComponent(action)}`).then(({ data }) => setLogs(data.data.logs)).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false)); }, 250);
    return () => clearTimeout(timer);
  }, [action]);
  return <div><PageHeader eyebrow="SÉCURITÉ" title="Journal d’audit" description="Historique des authentifications et des actions sensibles." /><Alert>{error}</Alert><section className="panel filters-panel single"><div className="search-field"><Search size={18} /><input placeholder="Filtrer par action…" value={action} onChange={(e) => setAction(e.target.value)} /></div></section><section className="panel table-panel">{loading ? <div className="panel-loader"><span className="loader" /></div> : logs.length === 0 ? <EmptyState title="Aucun événement" /> : <div className="table-scroll"><table><thead><tr><th>Date</th><th>Action</th><th>Résultat</th><th>Utilisateur</th><th>Adresse IP</th></tr></thead><tbody>{logs.map((log) => <tr key={log._id}><td>{new Date(log.createdAt).toLocaleString('fr-FR')}</td><td><code className="action-code">{log.action}</code></td><td><Badge value={log.status} /></td><td>{log.user ? <div className="table-primary"><strong>{log.user.firstName} {log.user.lastName}</strong><span>{log.user.email}</span></div> : 'Anonyme'}</td><td><code>{log.ipAddress}</code></td></tr>)}</tbody></table></div>}</section></div>;
}

