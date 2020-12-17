let db = require('./db');
let fs = require('fs').promises;
let nfs = require('fs');
const { java, python } = require('compile-run');

/**
 * Helper to call the needed processes 
 * @param {String} f1 Path to student file f1 within ./localspace/lab-userid
 * @param {*} utest Path to unit test within ./localspace/lab-userid
 */
function grade(id, f1, utest) {
  let fid = id + '-' + req.params.labId;


  if (!await pcess.checkExt(f1, req.params.labId))
    throw Error('Incorrect file format!')
  //await pcess.storeFile(id+'/'+req.file.filename, req.file.filename , false, req.params.labId)
  
  //fetch grader file?
  await pcess.fetchFile(10, './localspace/' + fid + '/');
  
  
  //run the damned file
  await pcess.run('./localspace/' + fid + '/' + 'testing.java');
}

/**
 * Fetches a file given its fid from database.
 * Stores it in a path in the directory.
 * @param {Number} fid 
 * @param {string} path the directory to store in
 */
async function fetchFile(fid, path) {
  let response = await db.query('SELECT * FROM files WHERE id=%s', fid);

  if (!response.rows) {
    throw new Error('File not found');
  }
  response.rows.forEach(async (v, i) => {
    nfs.writeFileSync(path + v.name, v.content);

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
 * 
 * @param {String} path from ./localspace/
 * @param {String} name 
 * @param {boolean} isAttachment 
 * @param {String} labid 
 */
async function storeFile(path, name, isAttachment, labid) {
  let content = await fs.readFile('./localspace/' + path);
  let e = content.toString().split('.')[1]
  await db.query('INSERT INTO files (content, extension, name) VALUES (%L, %L, %L);', content.toString(), e, name);

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
  if (path.endsWith('.java')) {

    let res = await java.runFile(path);
    console.log(res)


  } else if(path.endsWith('.py')){
    let res = await python.runFile(path, {executionPath: "python3.8"})

  }
}



module.exports.storeFile = storeFile;
module.exports.checkExt = checkExt;
module.exports.resetDir = resetDir;
module.exports.fetchFile = fetchFile;
module.exports.grade = grade;
module.exports.run = run;

