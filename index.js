require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const app = express();
const crypto = require("crypto");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

// Usar body-parser para analizar datos de formularios
app.use(bodyParser.urlencoded({ extended: true }));

// db in memory
const urlDatabase = {};

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//(recibe datos desde el formulario)
app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

  let url;
  try {
    url = new URL(originalUrl);
  } catch (error) {
    return res.json({ error: "URL inválida" });
  }

  // Verificar si el dominio es accesible
  dns.lookup(url.hostname, (err) => {
    if (err) {
      return res.json({ error: "Dominio no encontrado" });
    }

    // Generar un identificador único de 6 caracteres
    const shortId = crypto.randomBytes(3).toString("hex");

    // Guardar la URL original en la base de datos usando el identificador corto
    urlDatabase[shortId] = originalUrl;

    // Enviar una respuesta con la URL acortada
    res.json({
      original_url: originalUrl,
      short_url: `/api/shorturl/${shortId}`,
    });
  });
});

// Ruta para redirigir desde la URL corta a la original
app.get("/api/shorturl/:shortId", (req, res) => {
  const shortId = req.params.shortId;
  const originalUrl = urlDatabase[shortId];

  if (originalUrl) {
    res.redirect(originalUrl); // Redirige a la URL original
  } else {
    res.status(404).send("URL no encontrada");
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
