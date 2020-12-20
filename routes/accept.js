const { exec } = require('child_process');
let db = require('./db');
let multer = require('multer');
let pcess = require('./process');
let fs = require('fs/promises');
let path = require('path')

const storage = multer.diskStorage({

    destination: async (req, file, cb) => {

        let id = req.session.id+'-'+req.params.labId;
        //let id = 34467 + '-' + req.params.labId;
        
        try{
            await fs.rmdir('./localspace/' + id, {recursive:true});
            await fs.mkdir('./localspace/' + id);
        } catch(e){
            console.log(e)
            await fs.mkdir('./localspace/' + id);
        }
        cb(null, './localspace/' + id);
        //filepath starts at main application file root for whatever fucking reason
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

class ErrorResponse extends Error {
    constructor(message, code){
        super(message);
        this.code=code
    }
}

module.exports.set = function (app) {
    // ENDPOINT THAT RECEIVES THE SUBMITTED FILE
    let upload = multer({ storage: storage });
    app.post('/file-submission/:labId', upload.single('file'), async (req, res) => {

        //HANDLE FILE HERE
        try {

            let classid = await db.query('SELECT classid FROM labs WHERE id=%s;', req.params.labId);
            //fetch class id from the lab. if nothing returns, the lab doesnt exist
            if (!classid.rows)
                throw new ErrorResponse('No matching information for submission found!',404)  

            let sclasses = await db.query('SELECT class FROM class_user WHERE uid=%s;', req.session.userid);

            if (!sclasses.rows[0] == classid.rows[0])
                throw new ErrorResponse('No permissions to submit to this lab!',403); //403 Forbidden
            
            
            const dirpath = path.join(`./localspace/`,`${req.session.id}-${req.params.labId}/`)
            
            //ideally, fire the async process, add to the queue. 
            //grade(req.session.userid, req.file.filename);
            
            res.status(200).send('Success!')
            return;

        } catch (e) {
            //todo: make this manage multiple status codes
            return res.status(404).send(e.message);
        }

    });


    //note: tell avik that the field name is 'files'
    //TEACHER GRADER SUBMISSION ONLY
    app.post('/grader-submission/:labId',upload.any('files'), async (req,res)=>{
        try{
            let classid = await db.query('SELECT classid FROM labs WHERE id=%s;', req.params.labId);
            //fetch class id from the lab. if nothing returns, the lab doesnt exist
            if (!classid.rows)
                throw new ErrorResponse('No matching information for submission found!', 404)


            let sclasses = await db.query('SELECT class FROM class_user WHERE uid=%s;', req.session.userid);

            if (!sclasses.rows[0] == classid.rows[0])
                throw new ErrorResponse('No permissions to submit to this lab!', 403);

            const dirpath = path.join(`./localspace/`,`${req.session.id}-${req.params.labId}/`)

                let id = 34467 + '-' + req.params.labId;

            let prevFiles = await db.query('SELECT (fid, is_attachment) FROM lab_files WHERE lab=%s', req.params.labId);

            prevFiles.rows.forEach( (e,i )=>{
                if(!e.is_attachment)
                    await db.query('DELETE FROM lab_files WHERE id=%s', e.fid)
            });
            //has to be a for loop since we have to make sure each file
            //is NOT an attachment file, grader files only

            res.status(200).send('Success!');
            return;

        } catch (e) {
            return res.status(404).send(e.message);
        }
    });

    app.post('/lab-attachments/:labId', upload.any('files'), async (req, res)=>{
        try{
            let classid = await db.query('SELECT classid FROM labs WHERE id=%s;', req.params.labId);
            //fetch class id from the lab. if nothing returns, the lab doesnt exist
            if (!classid.rows)
                throw new ErrorResponse('No matching information for submission found!', 404)


            let sclasses = await db.query('SELECT class FROM class_user WHERE uid=%s;', req.session.userid);

            if (!sclasses.rows[0] == classid.rows[0])
                throw new ErrorResponse('No permissions to submit to this lab!', 403);

            //remove all previous grader files in the database

            await db.query('DELETE FROM lab_files WHERE lab=%s;', req.params.labId);
            
            //has to be a for loop 
            //we have to make sure each file is a valid attachment

            const dirpath = path.join(`./localspace/`,`${req.session.id}-${req.params.labId}/`)
            const files = await fs.readdir(dirpath)
            //iterate through files and do the stuff
            let arr = [];
            for (const file of files){
                let fpath=path.join(dirpath, file)
                const dircheck = await fs.stat(fpath)
                if(dircheck.isDirectory()){
                    throw new ErrorResponse('Cannot upload folders!', 415) //415: unsupported media type
            
                }
                arr.push(await ops.storeFile(fpath, req.file.originalname)); //store file ids
            }

            for(const id of arr){
                await db.query(
                    'INSERT INTO lab_files (lab, fid, is_attachment) VALUES (%s,%s,%s);'
                    , req.params.labId, id, true);
            }

            res.status(200).send('Success!');
        }catch(e){
            if(e.code)
                res.status(e.code).send(e.message)
            else 
                res.status(500).send(e.message)
        }
    })
}