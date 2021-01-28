let db = require('./db')
let multer = require('multer');
let fs = require('fs');
let path = require('path')
let files = require('./process')

class ErrorResponse extends Error{
    constructor(message, code){
        super(message);
        this.code=code;
    }
}
//TODO fully implement error codes with this


const storage = multer.diskStorage({

    destination: async (req, file, cb) => {

        let id = req.session.userid;        
        try{
            await fs.promises.rmdir('./localspace/' + id, {recursive:true});
            await fs.promises.mkdir('./localspace/' + id);
        } catch(e){
            console.log(e)
            await fs.promises.mkdir('./localspace/' + id);
        }
        cb(null, './localspace/' + id);
        //filepath starts at main application file root for whatever fucking reason
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})


module.exports.set = function (app) {

    let upload = multer({ storage: storage });

    app.get('/addlab', async (req, res) => {
        return res.render('addlab', { user: req.session ? (req.session.exists ? req.session : false) : false });
    });

    app.post('/addlabverify', upload.single('graderFileUpload'), async (req,res)=>{
        
        
        //verify:
        /*
        1. class exists
        2. user has access to class
        3. user is a teacher
        4. parameter verification
        */

        let lid = await db.query('INSERT INTO labs (prompttxt, attempts, deadline, name, classid, visible_output, lang) VALUES'+
                                                    '(%L, %s, %s, %L, %s, %s, %L)', 
                                                    req.body.labDescriptionInput, req.body.submissionLimitInput, 
                                                    //null is deadline 
                                                    null, req.body.labNameInput, req.body.showStudentOutputBoolInput, 
                                                    req.body.labLanguageInput);
                                        
        let fid = await files.storeFile(req.file.path, req.file.originalname);
        if(fid==-1){
            throw new ErrorResponse('Failed to upload the file to the database.', 500)
        }
        if(lid.rowCount==0){
            throw new ErrorResponse('Failed to create the lab.', 500)
        }
        await fs.promises.rmdir(req.file.path);
        await db.query('INSERT INTO lab_files (lab, fid, is_attachment, is_test) VALUES (%s, %s, f, t);', lid.rows[0].id, fid);
        res.redirect('/class/'+req.body.classId);
        return;
    });


    

}