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

    app.post('/addlabverify',upload.any('graderFileUpload'), async (req,res)=>{
        console.log(req)
        
        //verify:
        /*
        1. class exists
        2. user has access to class
        3. user is a teacher
        4. parameter verification
        */

        

        let fid = await files.storeFile(req.file.path, req.file.originalname);
        if(fid==-1){
            throw new ErrorResponse('Failed to upload the file to the database.', 500)
        }
        await fs.promises.rmdir(req.file.path);

        res.redirect('/class/'+req.body.classId);
        return;
    });


    

}