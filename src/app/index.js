// Archivo: src/app/index.js
// Inicializa la app Express y configura vistas, rutas y middleware.
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const router = require("./router/router");

// Carga variables de entorno desde el fichero raíz .env
// require("dotenv").config({path: path.join(__dirname, "../../.env")});

// Cargar env en vercel
if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config({path: path.join(__dirname, '../../.env')});
}

const app = express();

// Ruta pública (static) y carpeta de vistas
const publicPath = path.join(__dirname, '../public');

// Configuración de la app
app.set("port", process.env.PORT || 4040);
app.set("views", path.join(publicPath, 'templates'));
app.set("view engine", "pug");

// Middleware: estáticos, logging y rutas
app.use(express.static(publicPath));
app.use(morgan("dev"));
app.use("/", router);

app.listen(app.get("port"), () => {
    console.log(`Servidor corriendo en http://localhost:${app.get("port")}`);
});