const { exec } = require('child_process');
const db = require('./db');
let multer = require('multer')

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, './localspace');
    },
    filename: (req, file, cb) => {
        let id = '123';
        console.log(file)
        let ext = file.originalname.match(/(\.[^.]+)$/);
        console.log('we got here')
        console.log(id + ext[0])
        cb(null, id + ext[0]);
    }
})



module.exports.set = function (app) {
    // ENDPOINT THAT RECEIVES THE SUBMITTED FILE
    let upload = multer({ storage: storage })
    app.post('/file-submission/:labId', upload.single('file'), async (req, res) => {
        // random redirect just for placeholder purposes

        //HANDLE FILE HERE
        console.log('woah')

        console.log('here')
        console.log(req.file)
        try {
            let classid = await db.query('SELECT classid FROM labs WHERE id=%s ;', req.params.labId)[0];
            let sclasses = await db.query('SELECT class FROM class_user WHERE uid=%s ;', req.session.userid);
            console.log('wtf')
            if (!sclasses.includes(classid))
                throw Error('No permissions to submit to this lab!')
            console.log('yeet')
            return req.status(200).send('Success!')


        } catch (e) {
            res.redirect('/error')
        }

    })
}