import AuditLog from './models/AuditLog.js';
import Comment from './models/Comment.js';
import Ticket from './models/Ticket.js';
import User from './models/User.js';

async function ensureUser(data) {
  const existing = await User.findOne({ email: data.email });
  return existing || User.create(data);
}

export async function seedDemoData() {
  if (process.env.SEED_DEMO !== 'true') return;
  const [admin, technician, employee] = await Promise.all([
    ensureUser({ firstName: 'Admin', lastName: 'SecureDesk', email: 'admin@securedesk.local', password: 'Admin123!', role: 'admin' }),
    ensureUser({ firstName: 'Sara', lastName: 'Technicienne', email: 'technicien@securedesk.local', password: 'Tech123!', role: 'technician' }),
    ensureUser({ firstName: 'Youssef', lastName: 'Employé', email: 'employe@securedesk.local', password: 'Employe123!', role: 'employee' }),
  ]);

  if (await Ticket.countDocuments() === 0) {
    const tickets = await Ticket.create([
      {
        title: 'Impossible de se connecter au Wi-Fi',
        description: 'La connexion au réseau interne échoue depuis ce matin sur mon ordinateur portable.',
        category: 'network', priority: 'high', status: 'in_progress', createdBy: employee._id, assignedTo: technician._id,
      },
      {
        title: 'Installation du logiciel de visioconférence',
        description: 'Je souhaite installer le logiciel autorisé pour participer à une réunion avec un client.',
        category: 'software', priority: 'medium', status: 'open', createdBy: employee._id,
      },
      {
        title: 'Réinitialisation de l’accès intranet',
        description: 'Mon mot de passe intranet a expiré et la procédure automatique ne fonctionne pas.',
        category: 'access', priority: 'urgent', status: 'resolved', createdBy: employee._id, assignedTo: technician._id, resolvedAt: new Date(),
      },
    ]);
    await Comment.create({
      content: 'Je prends en charge cet incident et je vérifie la configuration réseau.',
      ticket: tickets[0]._id,
      author: technician._id,
    });
    await AuditLog.create({ user: admin._id, action: 'DEMO_DATA_SEEDED', details: { tickets: tickets.length } });
  }
  console.log('Données de démonstration vérifiées.');
}

