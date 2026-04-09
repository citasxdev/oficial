const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const {
  ensureDataDirectory,
  listProfiles,
  createAndStoreProfile,
} = require('./src/services/profileService');
const { isMailConfigured, sendProfileByEmail } = require('./src/services/mailService');
const { isDriveConfigured, uploadXmlToDrive } = require('./src/services/driveService');

const app = express();
const PORT = Number(process.env.PORT || 5000);
const PUBLIC_DIR = path.join(__dirname, 'public');
const DEFAULT_NOTIFICATION_EMAIL = process.env.MAIL_DEFAULT_TO || '';

ensureDataDirectory();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((value) => value.trim())
      : true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(PUBLIC_DIR));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'dating-xml-platform',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/integraciones', (_req, res) => {
  res.json({
    gmail: {
      enabled: isMailConfigured(),
      defaultRecipientConfigured: Boolean(DEFAULT_NOTIFICATION_EMAIL),
    },
    googleDrive: {
      enabled: isDriveConfigured(),
      autoSync: isDriveConfigured(),
    },
  });
});

app.get('/api/perfiles', async (_req, res) => {
  try {
    const perfiles = await listProfiles();
    res.json({ perfiles });
  } catch (error) {
    console.error('Error leyendo perfiles:', error);
    res.status(500).json({ error: 'No se pudieron cargar los perfiles XML.' });
  }
});

app.post('/api/registro', async (req, res) => {
  const {
    nombre,
    edad,
    info,
    pais,
    imagenUrl,
    movil,
    estado,
    gustos,
    otros,
    cifrar,
    destinoEmail,
  } = req.body;

  const camposRequeridos = { nombre, edad, info, pais, imagenUrl, movil, estado, gustos };
  const faltantes = Object.entries(camposRequeridos)
    .filter(([, value]) => !String(value || '').trim())
    .map(([key]) => key);

  if (faltantes.length > 0) {
    return res.status(400).json({
      error: `Faltan campos obligatorios: ${faltantes.join(', ')}`,
    });
  }

  try {
    const registro = await createAndStoreProfile({
      nombre,
      edad,
      info,
      pais,
      imagenUrl,
      movil,
      estado,
      gustos,
      otros,
      cifrar: Boolean(cifrar),
    });

    const requestedRecipient = String(destinoEmail || '').trim();
    const recipients = [requestedRecipient, DEFAULT_NOTIFICATION_EMAIL].filter(Boolean);
    const integrationResults = {
      gmail: { enabled: isMailConfigured(), sent: false, recipients: recipients.length },
      googleDrive: { enabled: isDriveConfigured(), synced: false },
    };

    if (integrationResults.gmail.enabled && recipients.length > 0) {
      try {
        const mailResult = await sendProfileByEmail({
          to: recipients,
          subject: `Perfil XML creado: ${registro.profile.nombre}`,
          text: [
            `Se ha generado un nuevo perfil XML en la plataforma.`,
            `ID: ${registro.profile.id_unico}`,
            `Nombre: ${registro.profile.nombre}`,
            `Cifrado: ${registro.isEncrypted ? 'Sí' : 'No'}`,
          ].join('\n'),
          filename: registro.filename,
          content: registro.fileContent,
        });

        integrationResults.gmail.sent = true;
        integrationResults.gmail.messageId = mailResult.messageId;
      } catch (mailError) {
        integrationResults.gmail.error = mailError.message;
      }
    }

    if (integrationResults.googleDrive.enabled) {
      try {
        const driveResult = await uploadXmlToDrive({
          filename: registro.filename,
          filepath: registro.filepath,
        });
        integrationResults.googleDrive.synced = true;
        integrationResults.googleDrive.fileId = driveResult.id;
        integrationResults.googleDrive.webViewLink = driveResult.webViewLink;
      } catch (driveError) {
        integrationResults.googleDrive.error = driveError.message;
      }
    }

    const warnings = [];
    if (requestedRecipient && (!integrationResults.gmail.enabled || !integrationResults.gmail.sent)) {
      warnings.push('El XML se guardó, pero no pudo enviarse por correo con la configuración actual.');
    }
    if (integrationResults.googleDrive.enabled && !integrationResults.googleDrive.synced) {
      warnings.push('El XML se guardó localmente, pero falló la sincronización con Google Drive.');
    }

    return res.status(201).json({
      mensaje: warnings.length
        ? 'Registro guardado con advertencias de integración.'
        : 'Registro guardado correctamente.',
      archivo: registro.filename,
      perfilId: registro.profile.id_unico,
      cifrado: registro.isEncrypted,
      integraciones: integrationResults,
      warnings,
    });
  } catch (error) {
    console.error('Error al registrar perfil:', error);
    return res.status(500).json({
      error: 'No se pudo registrar el perfil XML.',
    });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
