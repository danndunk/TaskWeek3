// import pg pool
const { Pool } = require("pg");

//setup connection pool
const dbPool = new Pool({
  database: "tugas-week-3",
  port: 5432,
  user: "postgres",
  password: "Tuturu1*",
});

// export
module.exports = dbPool;
