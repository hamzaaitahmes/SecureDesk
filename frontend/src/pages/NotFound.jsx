import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return <div className="not-found"><ShieldAlert size={54} /><p className="eyebrow">ERREUR 404</p><h1>Cette page est introuvable</h1><p>L’adresse demandée n’existe pas ou vous n’avez pas accès à cette ressource.</p><Link className="button button-primary" to="/"><ArrowLeft size={18} /> Retour au tableau de bord</Link></div>;
}
