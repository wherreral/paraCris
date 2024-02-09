
const dotenv = require("dotenv");
dotenv.config()

const { Client } = require("pg");

const connectPSQLDb = async (tablename, database) => {
    
    try {

      const client = new Client({
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        //database: process.env.PGDATABASESTORE,
        database: database ? database : process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT
      })

      await client.connect()
      const res = await client.query('SELECT * FROM "public"."'+tablename+'"')
      //console.log(res.rows)
      await client.end()
      return res;
    }
    catch (error) 
    {
      console.log(error)
    }

}

module.exports = { connectPSQLDb};