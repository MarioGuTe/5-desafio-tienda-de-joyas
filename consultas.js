const { Pool } = require("pg");
const format = require("pg-format");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "mariogt",
  database: "joyas",
  allowExitOnIdle: true,
});

const obtenerJoyas = async ({
  limits = 6,
  order_by = "stock_ASC",
  page = 1,
}) => {
  const [campo, direccion] = order_by.split("_");
  const offset = (page - 1) * limits;

  const formattedQuery = format(
    "SELECT * FROM inventario ORDER BY %s %s LIMIT %s OFFSET %s",
    campo,
    direccion,
    limits,
    offset
  );

  const { rows: inventario } = await pool.query(formattedQuery);
  return inventario;
};

const obtenerJoyasPorFiltros = async ({
  precio_max,
  precio_min,
  categoria,
  metal,
}) => {
  let filtros = [];
  const values = [];
  const agregarFiltro = (campo, comparador, valor) => {
    values.push(valor);
    const { length } = filtros;
    filtros.push(`${campo} ${comparador} $${length + 1}`);
  };
  if (precio_max) agregarFiltro("precio", "<=", precio_max);
  if (precio_min) agregarFiltro("precio", ">=", precio_min);
  if (categoria) agregarFiltro("categoria", "=", categoria);
  if (metal) agregarFiltro("metal", "=", metal);
  let consulta = "SELECT * FROM inventario";
  if (filtros.length > 0) {
    filtros = filtros.join(" AND ");
    consulta += ` WHERE ${filtros}`;
  }
  const { rows: inventario } = await pool.query(consulta, values);
  return inventario;
};

const prepararHATEOAS = (joyas) => {
  const results = joyas.map((j) => {
    return {
      name: j.nombre,
      href: `/joyas/joya/${j.id}`,
    };
  });

  const totalJoyas = joyas.length;
  let stockTotal = joyas.reduce((a, b) => {
    return a + b.stock;
  }, 0);

  const HATEOAS = {
    totalJoyas,
    stockTotal,
    results,
  };
  return HATEOAS;
};

module.exports = { obtenerJoyas, obtenerJoyasPorFiltros, prepararHATEOAS };
