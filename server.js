const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// Endpoint para obtener todos los perfiles (lee todos los XML de data/)
app.get('/api/perfiles', (req, res) => {
  let perfiles = [];
  try {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.xml'));
    const parser = new xml2js.Parser({ explicitArray: false });

    for (const file of files) {
      const xml = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
      parser.parseString(xml, (err, result) => {
        if (err) return;
        // Soporta tanto <perfiles><perfil> como <registro><usuario>
        let lista = [];
        if (result?.perfiles?.perfil) {
          lista = Array.isArray(result.perfiles.perfil) ? result.perfiles.perfil : [result.perfiles.perfil];
        } else if (result?.registro?.usuario) {
          lista = [result.registro.usuario];
        }
        perfiles.push(...lista);
      });
    }
    // Pequeño retraso para asegurar parseo asíncrono (mejorable con promesas)
    setTimeout(() => res.json(perfiles), 50);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al leer archivos XML' });
  }
});

app.post('/api/registro', async (req, res) => {
  const { nombre, edad, info, pais, imagenUrl, movil, estado, gustos, otros } = req.body;

  const usuario = {
    nombre, edad, info, pais, imagen_url: imagenUrl,
    numero_movil: movil, estado_sentimental: estado, gustos, otros
  };

  const builder = new xml2js.Builder();
  const xml = builder.buildObject({ registro: { usuario } });

  // Guardar localmente
  const filename = `registro_${Date.now()}_${nombre.replace(/\s/g, '_')}.xml`;
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, xml, 'utf-8');

  // Configurar transporter para Gmail (usar contraseña de aplicación)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'verificado.y.seguro@gmail.com',
      subject: `Nuevo registro - ${nombre}`,
      text: 'Adjunto XML con los datos del usuario.',
      attachments: [{ filename, content: xml }]
    });
    res.json({ mensaje: 'Registro exitoso. XML guardado y enviado.' });
  } catch (error) {
    console.error('Error email:', error);
    // Aunque falle el email, el registro local ya está guardado
    res.status(500).json({ error: 'Registro guardado localmente, pero falló el envío de email.' });
  }
});

app.listen(PORT, () => console.log(`✅ Servidor activo en http://localhost:${PORT}`));