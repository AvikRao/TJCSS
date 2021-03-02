let db = require('./db');
let fs = require('fs').promises;
let nfs = require('fs');
const p = require('path')


/**
 * Fetches a file given its fid from database.
 * Stores it in a path in the directory.
 * @param {Number} fid 
 * @param {string} path the directory to store in
 * @returns {} the response object of the last file associated
 */
async function fetchFile(fid, path) {
  let response = await db.query('SELECT * FROM files WHERE id=%s', fid);

  if (!response.rows) {
    throw new Error('File not found');
  }
  let lastFile = undefined;
  response.rows.forEach( (v, i) => {
    nfs.writeFileSync(p.join(path, v.name), v.content);
    lastFile=v
  });

  lastFile=response.rows[0]
  return lastFile;
  //put file in directory

}
/**
 * 
 * @param {*} filename name of student submitted file
 * @param {*} labid id of lab
 * @returns {Boolean} true if file is correct extension 
 * */
async function checkExt(filename, labid) {
  let res = await db.query('SELECT * FROM lab_files WHERE is_attachment=True AND lab=%s;', labid);
  console.log(res)
  let fileext = res.rows.filter((v) => {
    v.ext = db.query('SELECT extension FROM files WHERE id=%s', v.fid);
    return v.ext != 'txt';
  })
  //assume 1 test file and multiple test files that are only text
  return fileext[0].ext == filename.match(/(\.[^.]+)$/)[0].slice(1);
}

/**
 * 
 * @param {String} path from .
 * @param {String} name 
 * @returns {Number} the assigned id of the file, -1 if it fails
 */
async function storeFile(path, name) {
  let content = await fs.readFile(path);
  let e = content.toString().split('.')[1]
  let resp = await db.query('INSERT INTO files (content, name) VALUES (%L, %L) RETURNING id;', content.toString(), name);
  if(resp.rowCount>0)
    return resp.rows[0].id
  else return -1
}

async function resetDir() {
  await fs.rmdir('./localspace');
  await init()
}
/**
 * 
 * @param {String} path 
 * @param {Object} params 
 * @param  {...any} args 
 */
async function run(path,{timeout, input}, ...args) {


  
}



module.exports.storeFile = storeFile;
module.exports.checkExt = checkExt;
module.exports.resetDir = resetDir;
module.exports.fetchFile = fetchFile;
module.exports.run = run;

