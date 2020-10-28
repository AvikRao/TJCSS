const { exec } = require('child_process');
let db = require('./db');
let multer = require('multer');
let pcess = require('./process');
let fs = require('fs/promises');

const storage = multer.diskStorage({

    destination: async (req, file, cb) => {

        //let id = req.session.id+':'+req.params.labId;
        let id = 34467+':'+req.params.labId;
        await fs.mkdir('./localspace/' + id)
        cb(null, './localspace/'+id);
        //filepath starts at main application file root for whatever fucking reason
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})



module.exports.set = function (app) {
    // ENDPOINT THAT RECEIVES THE SUBMITTED FILE
    let upload = multer({ storage: storage });
    app.post('/file-submission/:labId', upload.single('file'), async (req, res) => {

        //HANDLE FILE HERE
        try {

            let classid = await db.query('SELECT classid FROM labs WHERE id=%s;', req.params.labId);
            //fetch class id from the lab. if nothing returns, the lab doesnt exist
            if (!classid.rows)
                throw Error('No matching information for submission found!')


            //*************** REMOVE AFTER LOCALHOST DEV********************* */    
            req.session.userid = '34467'
            //*************** REMOVE AFTER LOCALHOST DEV********************* */    




            let sclasses = await db.query('SELECT class FROM class_user WHERE uid=%s;', req.session.userid);

            if (!sclasses.rows[0] == classid.rows[0])
                throw Error('No permissions to submit to this lab!');






            //if(!await pcess.checkExt(req.file.filename, req.params.labId))
            //    throw Error('Incorrect file format!')
            //await pcess.storeFile(req.file.filename, false, req.params.labId)

            res.status(200).send('Success!')
            return;

        } catch (e) {
            return res.status(404).send(e.message);
        }

    })
}