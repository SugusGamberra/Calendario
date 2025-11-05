const express = require("express");
const morgan = require("morgan");
const path = require("path");
const router = require("./router/router");

if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config({path: path.join(__dirname, '../../.env')});
}

const app = express();
const publicPath = path.join(__dirname, '../public');

app.set("port", process.env.PORT || 4040);
app.set("views", path.join(publicPath, 'templates'));
app.set("view engine", "pug");

app.use(express.static(publicPath));
app.use(morgan("dev"));
app.use("/", router);

module.exports = app;