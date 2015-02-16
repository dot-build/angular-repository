var express = require('express'),
	router = express.Router(),
	app = express();

router.get('/api/posts', function(req, res, next) {
	console.log(req.params);
	res.json([]);
});

app.use(express.static('src'))
	.use(express.static('vendor'))
	.use(router);

var server = app.listen(process.env.PORT || 8000, function() {
	console.log('Listening on port %d', server.address().port);
});
