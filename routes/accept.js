let db = require('./db');
let multer = require('multer');
let ops = require('./operations');
let fs = require('fs/promises');
let path = require('path')

class ErrorResponse extends Error{
    constructor(message, code){
        super(message);
        this.code=code;
    }
}
//TODO fully implement error codes with this


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


//TODO apply relevant error catching
module.exports.set = function (app) {
    // ENDPOINT THAT RECEIVES THE SUBMITTED FILE
    let upload = multer({ storage: storage });



    //note: tell avik that the field name is 'files'
    //TEACHER GRADER SUBMISSION ONLY
    app.post('/grader-file/:labId',upload.any('files'), async (req,res)=>{
        try{
            let classid = await db.query('SELECT classid FROM labs WHERE id=%s;', req.params.labId);
            //fetch class id from the lab. if nothing returns, the lab doesnt exist
            if (!classid.rows)
                throw ErrorResponse('No matching information for submission found!', 404)


            let sclasses = await db.query('SELECT class FROM class_user WHERE uid=%s;', req.session.userid);

            if (!sclasses.rows[0] == classid.rows[0])
                throw ErrorResponse('No permissions to submit to this lab!');

            //remove all previous grader files in the database
            //put these files in the database

            let prevFiles = await db.query('SELECT (fid, is_attachment) FROM lab_files WHERE lab=%s', req.params.labId);
            res.status(200).send('Success!')
            return;
        } catch(e){

        }
    });
    //TODO do this
    app.post('/lab-attachments/labId', upload.any('files'), async (req, res)=>{
        try{

        }catch(e){

        }
    })

}