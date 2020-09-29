const { Pool } = require('pg');
let format = require('pg-format')
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
async function query(query, ...args){
    const client = await pool.connect();  
    const result = client.query(format(query, ...args));
    client.release();
    return result;
}
module.exports.query = query;

//https://stackoverflow.com/questions/37243698/how-can-i-find-the-last-insert-id-with-node-js-and-postgresql
//for you, avik!

pool.on('error', (err, client) => {
    
    console.error(err);
    client.release(); 
    //disconect immediately upon error to free up for repeat query
});