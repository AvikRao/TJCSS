const { exec } = require('child_process');
const db = require('./db');
let multer = require('multer')

let storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, '../localspace');
    },
    filename: (req, file, cb) => {
        let id = req.session.userid
        let ext = file.filename.match(/(\.[^.]+)$/);
        cb(null, id+ext);
    }
})

let upload = multer({ dest: '../localspace' })

module.exports.set = function (app) {
    // ENDPOINT THAT RECEIVES THE SUBMITTED FILE
    app.post('/file-submission/:labId', async (req, res) => {
        // random redirect just for placeholder purposes

        //HANDLE FILE HERE
        db.query('SELECT ')

    })
}