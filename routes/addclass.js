let db = require('./db')

//heroku pg:psql -a tjcss

module.exports.set = function (app) {
    app.get('/addclass', async (req, res) => {
        return res.render('addclass', { user: req.session });

    });

    app.post('/addclassverify', async (req, res) => {
        return res.redirect('/');
    });
}