const labels = {
  open: 'Ouvert', in_progress: 'En cours', resolved: 'Résolu', closed: 'Fermé',
  low: 'Faible', medium: 'Moyenne', high: 'Haute', urgent: 'Urgente',
  employee: 'Employé', technician: 'Technicien', admin: 'Administrateur',
  hardware: 'Matériel', software: 'Logiciel', network: 'Réseau', access: 'Accès', other: 'Autre',
  success: 'Réussite', failure: 'Échec',
};

export function label(value) { return labels[value] || value || '—'; }

export default function Badge({ value, type = value }) {
  return <span className={`badge badge-${type}`}>{label(value)}</span>;
}

