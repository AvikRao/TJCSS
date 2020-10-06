let db = require('./db')

//heroku pg:psql -a tjcss

module.exports.set = function (app) {
    app.get('/', async (req, res) => {
        return res.render('index', { user: req.session ? (req.session.exists ? req.session : false) : false });

    });
}