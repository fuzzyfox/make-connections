var request = require('request'),
	jsdom   = require('jsdom').jsdom,
	fs      = require('fs'),
	makeapi = require('makeapi-client')({
		apiURL: "https://makeapi.webmaker.org"
	});

var visitedLinks = [],
	makes        = [];

var getLinks = function(make){
	request.get(make.url + '_', function(error, response, body){
		if(!error && response.statusCode === 200){
			body = body.replace(/<script(.*?)>(.*?)<\/script>/, '', 'ig');

			var doc	     = jsdom(body),
				window   = doc.parentWindow,
				document = window.document,
				tmp      = [];

			Array.prototype.slice.call(document.links).forEach(function(e, i, a){
				if(/(.+)\.makes\.org/.test(e.href)){
					tmp.push(e.href);
					console.log(e.href);
				}
			});

			make.links = tmp;

			fs.appendFile('tmp', JSON.stringify({
				url: make.url,
				links: make.links
			}) + ',\n');
			fs.appendFile('nodes', JSON.stringify({
				name: make.title,
				group: 0,
				url: make.url
			}) + ',\n');

			tmp.forEach(function(link, i, a){
				getMakeLinks(link, visitedLinks.indexOf(make.url));
			});
		}
	});
};

var getMakeLinks = function(url, target){
	if(visitedLinks.indexOf(url) === -1){
		makeapi.url(url).then(function(err, kit){
			if(err || kit.length === 0){
				console.log(err);
				return;
			}
			
			if(visitedLinks.indexOf(kit[0].url) === -1){
				visitedLinks.push(kit[0].url);

				fs.appendFile('links', JSON.stringify({
						source: visitedLinks.indexOf(kit[0].url), 
						target: target || 0,
						value: 10,
						url: url
					}) + ',\n');

				getLinks(kit[0], target);
			}
		});
	}
};

getMakeLinks(process.argv[2]);
