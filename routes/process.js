const { spawn } = require('child_process')
let db = require('./db');
let fs = require('fs').promises;
let nfs = require('fs');
const p = require('path')
const { java, python } = require('compile-run');

/**
 * Fetches a file given its fid from database.
 * Stores it in a path in the directory.
 * @param {Number} fid 
 * @param {string} path 
 */
async function fetchFile(fid, path) {
  let response = await db.query('SELECT * FROM files WHERE id=%s', fid);

  if (!response.rows) {
    throw new Error('File not found');
  }
  response.rows.forEach(async (v, i) => {
    nfs.writeFileSync(p.join(path,v.name), v.content);

  });

  //put file in directory

}
/**
 * 
 * @param {*} filename name of student submitted file
 * @param {*} labid id of lab
 * @returns {Boolean} true if file is correct extension 
 * */
async function checkExt(filename, labid) {
  let res = await db.query('SELECT * FROM lab_files WHERE is_attachment=True;');
  console.log(res)
  let fileext = res.rows.filter((v) => {
    v.ext = db.query('SELECT extension FROM files WHERE id=%s', v.fid);
    return v.ext != 'txt';
  })
  //assume 1 test file and multiple test files that are only text
  return fileext[0].ext == filename.match(/(\.[^.]+)$/)[0].slice(1);
}

/**
 * Stores a file in the files table. Update the lab table elsewhere, idiot
 * Returns array of objects containing id as property
 * @param {String} path from ./localspace/
 * @param {String} name 
 */
async function storeFile(path, name) {
  let content = await fs.readFile('./localspace/' + path);
  //console.log(content.toString())
  let e = content.toString().split('.')[1]
  return await db.query('INSERT INTO files (content, extension, name) VALUES (%L, %L, %L) RETURNING id;', content.toString(), e, name)
  .rows[0].id;

}

async function resetDir(dirpath) {
  await fs.rmdir(p.join('./localspace/', dirpath));
}
/**
 * 
 * @param {String} path 
 * @param {String} id
 * @param  {...any} args 
 */
async function run(path,{timeout, input}, ...args) {
  //assign the task to the queue
}


module.exports.storeFile = storeFile;
module.exports.checkExt = checkExt;
module.exports.resetDir = resetDir;
module.exports.fetchFile = fetchFile;
module.exports.run = run;

