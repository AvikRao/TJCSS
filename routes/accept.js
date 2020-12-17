const { exec } = require('child_process');
let db = require('./db');
let multer = require('multer');
let ops = require('./operations');
let fs = require('fs/promises');
let path = require('path')

const storage = multer.diskStorage({

    destination: async (req, file, cb) => {

        //let id = req.session.id+'-'+req.params.labId;
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



module.exports.set = function (app) {
    // ENDPOINT THAT RECEIVES THE SUBMITTED FILE
    let upload = multer({ storage: storage });

    //STUDENT SUBMISSIONS ONLY
    //TODO make this accept multiple files
    app.post('/file-submission/:labId', upload.single('file'), async (req, res) => {
        try {
            //ensure this lab exists 
            let classid = await db.query('SELECT classid FROM labs WHERE id=%s;', req.params.labId);
            //fetch class id from the lab. if nothing returns, the lab doesnt exist
            if (!classid.rows)
                throw Error('No matching information for submission found!')


            //*************** REMOVE AFTER LOCALHOST DEV********************* */    
            req.session.userid = req.session.userid ?? '34467'
            //*************** REMOVE AFTER LOCALHOST DEV********************* */    

            let sclasses = await db.query('SELECT class FROM class_user WHERE uid=%s;', req.session.userid);

            if (!sclasses.rows[0] == classid.rows[0])
                throw Error('No permissions to submit to this lab!');

            ops.grade(req.session.userid, req.file.filename)
            
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
                throw Error('No matching information for submission found!')


            let sclasses = await db.query('SELECT class FROM class_user WHERE uid=%s;', req.session.userid);

            if (!sclasses.rows[0] == classid.rows[0])
                throw Error('No permissions to submit to this lab!');

            //remove all previous grader files in the database
            //put these files in the database

            let prevFiles = await db.query('SELECT (fid, is_attachment) FROM lab_files WHERE lab=%s', req.params.labId);
            res.status(200).send('Success!')
            return;
        } catch(e){

        }
    });

    app.post('/lab-attachments/labId', upload.any('files'), async (req, res)=>{
        try{

        }catch(e){

        }
    })

    
}