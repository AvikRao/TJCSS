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



function deleteFile(dir, file) {
    return new Promise(function (resolve, reject) {
        var filePath = path.join(dir, file);
        fs.lstat(filePath, function (err, stats) {
            if (err) {
                return reject(err);
            }
            if (stats.isDirectory()) {
                resolve(deleteDirectory(filePath));
            } else {
                fs.unlink(filePath, function (err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            }
        });
    });
};
function deleteDirectory(dir) {
    return new Promise(function (resolve, reject) {
        fs.access(dir, function (err) {
            if (err) {
                return reject(err);
            }
            fs.readdir(dir, function (err, files) {
                if (err) {
                    return reject(err);
                }
                Promise.all(files.map(function (file) {
                    return deleteFile(dir, file);
                })).then(function () {
                    fs.rmdir(dir, function (err) {
                        if (err) {
                            return reject(err);
                        }
                        resolve();
                    });
                }).catch(reject);
            });
        });
    });
};

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
       ///*
        let columns = []
        let values = []
        let params = []
        if(req.body.labDescriptionInput){
            columns.push('prompttxt')
            values.push('%L')
            params.push(req.body.labDescriptionInput)
        }
        if(req.body.submissionLimitInput){
            columns.push('attempts')
            values.push('%s')
            params.push(req.body.submissionLimitInput)
        }
        if(req.body.deadline){
            ;
            //TODO TURN DEADLINE INTO TIMESTAMP
        }
        if(req.body.labNameInput){
            columns.push('name')
            values.push('%L')
            params.push(req.body.labNameInput)
        }
        if(req.body.classId){
            columns.push('classid')
            values.push('%s')
            params.push(req.body.classId)
        }
        if((typeof req.body.showStudentOutputBoolInput) !== 'undefined' ){
            columns.push('visible_output')
            values.push('%L')
            params.push(req.body.showStudentOutputBoolInput === 'on')
        }
        if(req.body.labLanguageInput){
            columns.push('lang')
            values.push('%L')
            params.push(req.body.labLanguageInput)
        }

        //*/
        let args = [`INSERT INTO labs (${columns.join(', ')}) VALUES (${values.join(', ')}) RETURNING id;`].concat(params)
        console.log(args)
        let lid = await db.query.apply(undefined,args);
                                        
        let fid = await files.storeFile(req.file.path, req.file.originalname);
        if(fid==-1){
            throw new ErrorResponse('Failed to upload the file to the database.', 500)
        }
        if(lid.rowCount==0){
            throw new ErrorResponse('Failed to create the lab.', 500)
        }
        
        await deleteDirectory(path.dirname(req.file.path));
        await db.query('INSERT INTO lab_files (lab, fid, is_attachment, is_test) VALUES (%s, %s, f, t);', lid.rows[0].id, fid);
        res.redirect('/class/'+req.body.classId);
        return;
    });


    

}