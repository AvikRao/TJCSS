let express = require('express');
let app = express();
let hbs = require('hbs');
let path = require('path');
let cookieSession = require('cookie-session')

let routes = require('./routes')
app.use(express.static('static'));
hbs.registerPartials(__dirname + '/views/partials');

app.use(express.static('static'));

app.set('port', process.env.PORT || 8080);

app.set('view engine', 'hbs');

app.set('trust proxy', 1)
app.use(cookieSession({
	name: 'peppermint',
	keys: ['director Broke have a nice day', '1123xXx_pHasZe_qu1ckSc0p3r_xXx1123']
}))


routes.set(app);

let listener = app.listen(app.get('port'), function () {
	console.log('Express server started on port: ' + listener.address().port);
});