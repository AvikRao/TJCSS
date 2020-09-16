let express = require('express');
let app = express();
let hbs = require('hbs');
app.use(express.static('static'));
hbs.registerPartials(__dirname + '/views/partials');

app.use(express.static('static'));
app.set('port', process.env.PORT || 8080);

app.set('view engine', 'hbs');

// routes.set(app);

app.get('/', (req, res) => {
	// res.send('yeet');
	res.render('index');
});

let listener = app.listen(app.get('port'), function () {
	console.log('Express server started on port: ' + listener.address().port);
});