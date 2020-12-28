let db = require('./db')

//heroku pg:psql -a tjcss

module.exports.set = function (app) {
    app.get('/addlab', async (req, res) => {
        return res.render('addlab', { user: req.session ? (req.session.exists ? req.session : false) : false });

    });
}