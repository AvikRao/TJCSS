let express = require('express');
let app = express();
let hbs = require('hbs');
let routes = require('./routes');
app.use(express.static('static'));


app.use(express.static('static'));
app.set('port', process.env.PORT || 8080);

app.set('view engine', 'hbs');

routes.set(app);

let listener = app.listen(app.get('port'), function () {
	console.log('Express server started on port: ' + listener.address().port);
});