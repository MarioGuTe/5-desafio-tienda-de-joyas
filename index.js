const express = require("express");
const app = express();
const cors = require("cors");
const {
  obtenerJoyas,
  obtenerJoyasPorFiltros,
  prepararHATEOAS,
} = require("./consultas");

app.use(cors());
app.use(express.json());

app.listen(3000, () => {
  console.log("servidor de joyas ON");
});

const reportarConsulta = async (req, res, next) => {
  const url = req.url;
  let message = `
  Hoy ${new Date()}
  Se ha recibido una consulta en la ruta ${url} 
  `;
  console.log(message);
  next();
};

app.get("/joyas", reportarConsulta, async (req, res) => {
  try {
    const queryStrings = req.query;
    const joyas = await obtenerJoyas(queryStrings);
    const HATEOAS = await prepararHATEOAS(joyas);
    res.json(HATEOAS);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/joyas/filtros", reportarConsulta, async (req, res) => {
  try {
    const queryStrings = req.query;
    const joyas = await obtenerJoyasPorFiltros(queryStrings);
    res.json(joyas);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("*", (req, res) => {
  res.status(404).send("Esta ruta no existe");
});
