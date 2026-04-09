const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const xml2js = require('xml2js');
const { encryptText, decryptText } = require('../utils/crypto');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const parser = new xml2js.Parser({ explicitArray: false, trim: true });
const builder = new xml2js.Builder({ headless: false, renderOpts: { pretty: true, indent: '  ' } });

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function generateUniqueId() {
  const base = `${Date.now()}-${Math.random()}-${process.pid}`;
  return crypto.createHash('sha1').update(base).digest('hex').slice(0, 16);
}

function slugify(value) {
  return String(value || 'perfil')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function collectXmlFiles(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return collectXmlFiles(fullPath);
    }

    if (entry.isFile() && (entry.name.endsWith('.xml') || entry.name.endsWith('.enc.xml'))) {
      return [fullPath];
    }

    return [];
  });
}

async function parseXmlContent(xmlContent, encrypted) {
  let plainXml = xmlContent;

  if (encrypted) {
    const lines = xmlContent.split('\n');
    const ivLine = lines.find((line) => line.startsWith('<!--IV:'));
    if (!ivLine) {
      throw new Error('No se encontró el IV para descifrar el XML.');
    }

    const match = ivLine.match(/<!--IV:([a-f0-9]+)-->/i);
    if (!match) {
      throw new Error('El IV del XML cifrado no es válido.');
    }

    const encryptedBody = lines.filter((line) => !line.startsWith('<!--IV:')).join('\n').trim();
    plainXml = decryptText(encryptedBody, match[1]);
  }

  return parser.parseStringPromise(plainXml);
}

function normalizeProfile(profile, sourceFile, encrypted) {
  return {
    nombre: profile.nombre || 'Perfil sin nombre',
    edad: profile.edad || 'N/D',
    info: profile.info || 'Sin descripción disponible.',
    pais: profile.pais || 'No indicado',
    imagen_url: profile.imagen_url || '',
    numero_movil: profile.numero_movil || '',
    estado_sentimental: profile.estado_sentimental || 'No indicado',
    gustos: profile.gustos || 'No indicado',
    otros: profile.otros || '',
    id_unico: profile.id_unico || '',
    fecha_registro: profile.fecha_registro || '',
    cifrado: encrypted,
    archivo: path.basename(sourceFile),
  };
}

function extractProfiles(document, sourceFile, encrypted) {
  if (document?.registro?.usuario) {
    return [normalizeProfile(document.registro.usuario, sourceFile, encrypted)];
  }

  if (document?.perfiles?.perfil) {
    const profiles = Array.isArray(document.perfiles.perfil)
      ? document.perfiles.perfil
      : [document.perfiles.perfil];
    return profiles.map((profile) => normalizeProfile(profile, sourceFile, encrypted));
  }

  return [];
}

async function listProfiles() {
  ensureDataDirectory();

  const xmlFiles = collectXmlFiles(DATA_DIR);
  const loadedProfiles = [];

  for (const file of xmlFiles) {
    const rawContent = fs.readFileSync(file, 'utf8');
    const encrypted = file.endsWith('.enc.xml');

    try {
      const document = await parseXmlContent(rawContent, encrypted);
      loadedProfiles.push(...extractProfiles(document, file, encrypted));
    } catch (_error) {
      loadedProfiles.push({
        nombre: 'Perfil no legible',
        edad: 'N/D',
        info: 'No se pudo interpretar el archivo XML.',
        pais: 'Desconocido',
        imagen_url: '',
        numero_movil: '',
        estado_sentimental: 'No disponible',
        gustos: 'No disponible',
        otros: '',
        id_unico: '',
        fecha_registro: '',
        cifrado: true,
        archivo: path.basename(file),
      });
    }
  }

  return loadedProfiles.sort((left, right) => {
    const leftDate = left.fecha_registro ? new Date(left.fecha_registro).getTime() : 0;
    const rightDate = right.fecha_registro ? new Date(right.fecha_registro).getTime() : 0;
    return rightDate - leftDate;
  });
}

async function createAndStoreProfile(input) {
  ensureDataDirectory();

  const profile = {
    nombre: String(input.nombre).trim(),
    edad: String(input.edad).trim(),
    info: String(input.info).trim(),
    pais: String(input.pais).trim(),
    imagen_url: String(input.imagenUrl).trim(),
    numero_movil: String(input.movil).trim(),
    estado_sentimental: String(input.estado).trim(),
    gustos: String(input.gustos).trim(),
    otros: String(input.otros || '').trim(),
    id_unico: generateUniqueId(),
    fecha_registro: new Date().toISOString(),
  };

  const xml = builder.buildObject({ registro: { usuario: profile } });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseFilename = `${timestamp}-${slugify(profile.nombre)}`;

  let filename = `${baseFilename}.xml`;
  let fileContent = xml;

  if (input.cifrar) {
    const { encrypted, iv } = encryptText(xml);
    filename = `${baseFilename}.enc.xml`;
    fileContent = `<!--IV:${iv}-->\n${encrypted}`;
  }

  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, fileContent, 'utf8');

  return {
    filepath,
    filename,
    fileContent,
    isEncrypted: Boolean(input.cifrar),
    profile,
  };
}

module.exports = {
  DATA_DIR,
  ensureDataDirectory,
  listProfiles,
  createAndStoreProfile,
};
