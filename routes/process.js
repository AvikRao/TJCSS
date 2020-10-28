const {exec} = require('child_process')
let db = require('./db');
let fs = require('fs').promises;

/**
 * Helper to call the needed processes per 
 * @param {String} f1 Path to student file f1 within ./localspace/uniquefile
 * @param {*} utest Path to unit test within ./localspace/uniquefile
 */
function grade(f1, utest){

}

/**
 * Fetches a file given its fid from database.
 * Stores it in a path in the directory.
 * @param {Number} fid 
 * @param {string} path 
 */
function fetchFile(fid, path){
    
}
/**
 * 
 * @param {*} filename name of student submitted file
 * @param {*} labid id of lab
 * @returns {Boolean} true if file is correct extension 
 * */
async function checkExt(filename, labid){
    let res = await db.query('SELECT * FROM lab_files WHERE is_attachment=True;');
    console.log(res)
    let fileext = res.rows.filter((v)=>{
        v.ext = db.query('SELECT extension FROM files WHERE id=%s',v.fid);
        return v.ext != 'txt';
    })
    //assume 1 test file and multiple test files that are only text
    return fileext[0].ext == filename.match(/(\.[^.]+)$/)[0].slice(1);
}


async function storeFile(name, isAttachment, labid){
    let content = await fs.readFile('./localspace/'+name);
    console.log(content.toString())
    await db.query('INSERT INTO files (content, extension, name) VALUES (%L, %L, %L);', content.toString(),false, 1); 
    
}

async function resetDir(){
    await fs.rmdir('./localspace');
    await init()
}


module.exports.storeFile=storeFile;
module.exports.checkExt=checkExt;
module.exports.resetDir=resetDir;
