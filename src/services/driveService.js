const fs = require('fs');
const { google } = require('googleapis');

function isDriveConfigured() {
  return Boolean(
    process.env.GOOGLE_DRIVE_PARENT_ID &&
      (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE ||
        (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)),
  );
}

function getDriveAuthOptions() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE) {
    return {
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
      scopes: ['https://www.googleapis.com/auth/drive'],
    };
  }

  return {
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: String(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  };
}

async function getDriveClient() {
  if (!isDriveConfigured()) {
    throw new Error('Google Drive no está configurado.');
  }

  const auth = new google.auth.GoogleAuth(getDriveAuthOptions());
  return google.drive({ version: 'v3', auth });
}

/**
 * Limpia carpetas antiguas y crea una nueva para el respaldo actual.
 * Se llama automáticamente para mantener el Drive organizado.
 */
async function setupBackupFolder(drive) {
  const parentId = process.env.GOOGLE_DRIVE_PARENT_ID;
  
  // 1. Listar carpetas existentes en el directorio padre
  const response = await drive.files.list({
    q: `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name)',
  });

  const folders = response.data.files || [];
  
  // 2. Eliminar carpetas previas (según requerimiento de "eliminar carpetas existentes")
  for (const folder of folders) {
    try {
      await drive.files.update({
        fileId: folder.id,
        requestBody: { trashed: true }
      });
      console.log(`Carpeta antigua eliminada: ${folder.name} (${folder.id})`);
    } catch (err) {
      console.error(`Error eliminando carpeta ${folder.id}:`, err.message);
    }
  }

  // 3. Crear nueva carpeta de respaldo con la fecha actual
  const folderName = `Respaldo_Perfiles_${new Date().toISOString().split('T')[0]}`;
  const folderMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentId],
  };

  const newFolder = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id',
  });

  console.log(`Nueva carpeta de respaldo creada: ${folderName} (${newFolder.data.id})`);
  return newFolder.data.id;
}

async function uploadXmlToDrive({ filename, filepath }) {
  const drive = await getDriveClient();
  
  // Obtener o crear la carpeta de destino
  // Nota: En una implementación de producción, podríamos cachear el folderId por sesión/día
  const folderId = await setupBackupFolder(drive);

  const media = {
    mimeType: 'application/xml',
    body: fs.createReadStream(filepath),
  };

  const created = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
    },
    media,
    fields: 'id, name, webViewLink',
  });

  return created.data;
}

module.exports = {
  isDriveConfigured,
  uploadXmlToDrive,
};
