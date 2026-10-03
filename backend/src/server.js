import 'dotenv/config';
import fs from 'node:fs';
import app from './app.js';
import { connectDatabase } from './config/db.js';
import { uploadsDir } from './middleware/upload.js';
import { seedDemoData } from './seed.js';

const requiredVariables = ['MONGO_URI', 'JWT_SECRET'];
for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    console.error(`Variable obligatoire absente : ${variable}`);
    process.exit(1);
  }
}
if (process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET doit contenir au moins 32 caractères.');
  process.exit(1);
}

fs.mkdirSync(uploadsDir, { recursive: true });
const port = Number(process.env.PORT) || 5000;

try {
  await connectDatabase();
  await seedDemoData();
  app.listen(port, () => console.log(`SecureDesk API disponible sur le port ${port}`));
} catch (error) {
  console.error('Démarrage impossible :', error.message);
  process.exit(1);
}

