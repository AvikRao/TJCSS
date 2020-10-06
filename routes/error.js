module.exports.set = function (app) {
    app.get('/error', async (req, res) => {
        return res.render('error', { user: req.session ? (req.session.exists ? req.session : false) : false });
    });
}