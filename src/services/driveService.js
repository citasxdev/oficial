const fs = require('fs');
const { google } = require('googleapis');

function isDriveConfigured() {
  return Boolean(
    process.env.GOOGLE_DRIVE_FOLDER_ID &&
      (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE ||
        (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)),
  );
}

function getDriveAuthOptions() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE) {
    return {
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    };
  }

  return {
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: String(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  };
}

async function getDriveClient() {
  if (!isDriveConfigured()) {
    throw new Error('Google Drive no está configurado.');
  }

  const auth = new google.auth.GoogleAuth(getDriveAuthOptions());
  return google.drive({ version: 'v3', auth });
}

async function findExistingFile(drive, filename) {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const response = await drive.files.list({
    q: [
      `'${folderId}' in parents`,
      `name = '${filename.replace(/'/g, "\\'")}'`,
      'trashed = false',
    ].join(' and '),
    fields: 'files(id, name)',
    pageSize: 1,
  });

  return response.data.files?.[0] || null;
}

async function uploadXmlToDrive({ filename, filepath }) {
  const drive = await getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const media = {
    mimeType: 'application/xml',
    body: fs.createReadStream(filepath),
  };

  const existingFile = await findExistingFile(drive, filename);

  if (existingFile) {
    const updated = await drive.files.update({
      fileId: existingFile.id,
      media,
      fields: 'id, name, webViewLink',
    });
    return updated.data;
  }

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
