"use strict";

var express = require('express')
	, http = require('http')
	, stylus = require('stylus')
	, nib = require('nib');

var app = express();

var server = http.createServer(app);
server.listen( 3000, function() {
	console.log('Server is listening on port: 3000');
});

var io = require('socket.io').listen(server);

function compile( str, path ) {
	return stylus(str)
		.set('filename', path)
		.use(nib());
}

/*var sys = require('sys');
var OAuth = require('oauth').OAuth;
var oa = new OAuth( 'https://twitter.com/oauth/request_token',
	'https://twitter.com/oauth/access_token',
	consumer_key, consumer_secret,
	'1.0A', 'http://localhost:3000/oauth/callback', 'HMAC-SHA1');

var access_token = "398419147-ogXghqoUOLzfz34kD7aRJLXhCDwLLeLwvVz5VFMY";
var access_token_secret = "HDeXIXHXhEG6vFfP0h585TGiVOU1ZOhveCggcXAc2A";

var sampleData = {};

oa.get("https://stream.twitter.com/1.1/statuses/sample.json", access_token, access_token_secret, function(error, data) {
	if(error) console.log(error);
	sampleData = data;
});
*/

var fs = require('fs');
var sampleData = require(__dirname + '/sample.json');

app.set('views', __dirname + '/app/views');
app.set('view engine', 'jade');

app.use(express.methodOverride());
app.use(stylus.middleware(
	{
		src: __dirname + '/app/assets/stylesheets',
		dest: __dirname + '/public/css',
		compile: compile
	}
));
app.use(express.static(__dirname + '/public'));

app.get('/', function( req, res ) {
	res.render('index', {
		title: 'Home'
	});
});

var tweets = sampleData.tweets;

io.sockets.on( 'connection', function(socket) {
	
	var counter = 0;
	if( counter < sampleData.length - 1 ) counter = 0;
	setInterval( function() {
		if( tweets && tweets[counter] ) {
			newPost({ 'screen_name': tweets[counter].user.screen_name, 'text': tweets[counter].text });
			counter++;
			console.log('yes');
		}
	}, 2000);

	function newPost(post) {
		socket.emit( 'newPost', post );
	}

});