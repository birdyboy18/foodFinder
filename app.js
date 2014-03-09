
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var request = require('request');
var path = require('path');

//require the file system module
var fs = require('fs');
//require the xm2js module
var xml2js = require('xml2js');
//make a new parser
var xmlParser = new xml2js.Parser();

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

//Load the xml file from static and parse it into json
/*fs.readFile( __dirname + '/public/xml/FoodHygiene2013Bournemouth.xml', function(err,data) {
	xmlParser.parseString(data, function(err,result){
		json = JSON.stringify(result);
	});
});*/

app.get('/business/:type', function(req,res){
	var type = req.params.type;
	getBusinessTypes(slugToId(type),function(json){
		var data = [];

		for ( var i =0; i < json.establishments.length; i++) {
			//Make a new custom object
			data.push({
				businessName: json.establishments[i].BusinessName,
				businessType: json.establishments[i].BusinessType,
				ratingValue: json.establishments[i].RatingValue,
				scores: json.establishments[i].scores,
				address: {
					line1: json.establishments[i].AddressLine1,
					line2: json.establishments[i].AddressLine1,
					line3: json.establishments[i].AddressLine3,
					line4: json.establishments[i].AddressLine4,
					postcode: json.establishments[i].PostCode
				},
				geocode: json.establishments[i].geocode,
			});
		}

		res.json(data);
	});
});

app.get('/takeaway', function(req,res){
	res.sendfile(__dirname + '/public/takeaways.html');
});

app.get('/pub', function(req,res){
	res.sendfile(__dirname + '/public/pubs.html');
});

app.get('/restaurant', function(req,res){
	res.sendfile(__dirname + '/public/restaurants.html');
});

app.get('/shack', function(req,res){
	res.sendfile(__dirname + '/public/shacks.html');
});



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port')); 
});


//Function to grab establishments

function getBusinessTypes(ID,callback) {
	/*
		BusinessTypeId: 7844,
       	BusinessTypeName: 'Takeaway/sandwich shop'

       	BusinessTypeId: 1,
       	BusinessTypeName: 'Restaurant/Cafe/Canteen'

       	BusinessTypeId: 7843,
       	BusinessTypeName: 'Pub/bar/nightclub',

       	BusinessTypeId: 7846,
      	BusinessTypeName": "Mobile caterer",
	*/
	var options = {
		url: 'http://api.ratings.food.gov.uk/Establishments?localAuthorityId=328&businessTypeId=' + ID,
		headers: {
			'x-api-version': 2,
			'content-type': 'application/json',
			'accept': 'application/json'
		}
	}

	request.get(options, function(err,res,body){
		callback(JSON.parse(body));
	})
}

function slugToId(slug) {
	switch(slug) {
		case 'pubs':
			return 7843;
			break;
		case 'restaurants':
			return 1;
			break;
		case 'takeaways':
			return 7844;
			break;
		case 'shacks':
			return 7846
			break;
		default:
	}
}
