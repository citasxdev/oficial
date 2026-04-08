const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = crypto.scryptSync(process.env.ENCRYPT_KEY || 'clave_super_segura_dating_xml_2024', 'salt', 32);
const IV_LENGTH = 16;

function encryptXml(xmlString) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(xmlString, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { encrypted, iv: iv.toString('hex') };
}

function decryptXml(encryptedHex, ivHex) {
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function generateUniqueId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  const hash = crypto.createHash('sha256').update(timestamp + random + process.pid).digest('hex').slice(0, 8);
  return `${timestamp}-${random}-${hash}`;
}

app.get('/api/perfiles', (req, res) => {
  let perfilesList = [];
  try {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.xml') || f.endsWith('.enc.xml'));
    const parser = new xml2js.Parser({ explicitArray: false });
    for (const file of files) {
      let xmlContent = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
      let isEncrypted = file.endsWith('.enc.xml');
      let parsedData = null;
      try {
        if (isEncrypted) {
          const lines = xmlContent.split('\n');
          const ivLine = lines.find(l => l.startsWith('<!--IV:'));
          if (ivLine) {
            const ivHex = ivLine.match(/<!--IV:([a-f0-9]+)-->/)[1];
            const encryptedPart = lines.filter(l => !l.startsWith('<!--IV:')).join('\n');
            const decryptedXml = decryptXml(encryptedPart.trim(), ivHex);
            parser.parseString(decryptedXml, (err, result) => {
              if (!err && result?.registro?.usuario) parsedData = result.registro.usuario;
              else if (!err && result?.perfiles?.perfil) parsedData = Array.isArray(result.perfiles.perfil) ? result.perfiles.perfil : [result.perfiles.perfil];
            });
          }
        } else {
          parser.parseString(xmlContent, (err, result) => {
            if (!err && result?.registro?.usuario) parsedData = result.registro.usuario;
            else if (!err && result?.perfiles?.perfil) parsedData = Array.isArray(result.perfiles.perfil) ? result.perfiles.perfil : [result.perfiles.perfil];
          });
        }
        if (parsedData) {
          if (Array.isArray(parsedData)) perfilesList.push(...parsedData.map(p => ({ ...p, cifrado: isEncrypted })));
          else perfilesList.push({ ...parsedData, cifrado: isEncrypted });
        } else {
          perfilesList.push({ nombre: 'Perfil cifrado no descifrable', edad: '??', pais: '??', estado_sentimental: '??', gustos: '??', info: 'Contenido protegido', imagen_url: '', cifrado: true });
        }
      } catch (err) {
        perfilesList.push({ nombre: 'Perfil corrupto/cifrado', edad: '??', pais: '??', estado_sentimental: '??', gustos: '??', info: 'No se pudo leer', imagen_url: '', cifrado: true });
      }
    }
    setTimeout(() => res.json({ perfiles: perfilesList }), 30);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al leer archivos XML' });
  }
});

app.post('/api/registro', async (req, res) => {
  const { nombre, edad, info, pais, imagenUrl, movil, estado, gustos, otros, cifrar } = req.body;
  const usuario = {
    nombre, edad, info, pais, imagen_url: imagenUrl,
    numero_movil: movil, estado_sentimental: estado, gustos, otros,
    id_unico: generateUniqueId(),
    fecha_registro: new Date().toISOString()
  };
  const builder = new xml2js.Builder();
  let xml = builder.buildObject({ registro: { usuario } });
  let filename = `registro_${Date.now()}_${nombre.replace(/\s/g, '_')}.xml`;
  let finalXml = xml;
  if (cifrar) {
    const { encrypted, iv } = encryptXml(xml);
    finalXml = `<!--IV:${iv}-->\n${encrypted}`;
    filename = filename.replace('.xml', '.enc.xml');
  }
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, finalXml, 'utf-8');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'verificado.y.seguro@gmail.com',
      subject: `Nuevo registro - ${nombre} - ID ${usuario.id_unico}`,
      text: `Adjunto XML del usuario. Cifrado: ${cifrar}`,
      attachments: [{ filename, content: finalXml }]
    });
    res.json({ mensaje: 'Registro exitoso. XML guardado y enviado.' });
  } catch (error) {
    console.error('Error email:', error);
    res.status(500).json({ error: 'Registro guardado localmente, pero falló el envío de email.' });
  }
});

app.listen(PORT, () => console.log(`✅ Servidor activo en http://localhost:${PORT}`));