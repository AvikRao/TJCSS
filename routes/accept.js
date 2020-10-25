const { exec } = require('child_process');
let db = require('./db');
let multer = require('multer')

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, './localspace');
    },
    filename: (req, file, cb) => {
        let id = '123';
        let ext = file.originalname.match(/(\.[^.]+)$/);

        cb(null, id + ext[0]);
    }
})



module.exports.set = function (app) {
    // ENDPOINT THAT RECEIVES THE SUBMITTED FILE
    let upload = multer({ storage: storage });
    app.post('/file-submission/:labId', upload.single('file'), async (req, res) => {
        // random redirect just for placeholder purposes

        //HANDLE FILE HERE
        try {

            let classid = await db.query('SELECT classid FROM labs WHERE id=%s;', req.params.labId);
            //fetch class id from the lab. if nothing returns, the lab doesnt exist
            if(!classid.rows)
                throw Error('No matching information for submission found!')


            //*************** REMOVE AFTER LOCALHOST DEV********************* */    
            req.session.userid = '34467'
            //*************** REMOVE AFTER LOCALHOST DEV********************* */    




            let sclasses = await db.query('SELECT class FROM class_user WHERE uid=%s;', req.session.userid);

            if (!sclasses.rows[0] == classid.rows[0])
                throw Error('No permissions to submit to this lab!');
            return res.status(200).send('Success!')


        } catch (e) {
            return res.status(404).send(e.message);
        }

    })
}