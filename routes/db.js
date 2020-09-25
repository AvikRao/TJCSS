const { Pool } = require('pg');

const pool = new Pool( {
    connectionString:process.env.DATABASE_URL,
    max:19,
    ssl: {
        rejectUnauthorized: false
      }
});

/**
 * 
 * @param {String} query 
 * @param {Array} insertData 
 * @returns {Array}
 * Accepts a PostgreSQL query and an array of data values to format
 * 
 */
async function query(query, data){
    const client = await pool.connect();
    const result = client.query(query, data);
    client.release();
    return result;
}
module.exports.query = query;

pool.on('error', (err, client) => {
    
    console.error(err);
    client.release(); 
    //disconect immediately upon error to free up for repeat query
});