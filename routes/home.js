let cookieSession = require('cookie-session')

module.exports.set = function (app) {
    app.get('/', (req, res) => {
        app.set('trust proxy', 1)
        app.use(cookieSession({
            name: 'peppermint',
            keys: ['director Broke have a nice day', '1123xXx_pHasZe_qu1ckSc0p3r_xXx1123']
        }))
        console.log(req.session);
        res.render('index', { user: req.session ? req.session.display_name : '' });
    });
}