/*

	Hat Tip to STomlinson for helping solve node async pain.
 */ 

var request = require('request'),
	jsdom   = require('jsdom').jsdom,
	fs      = require('fs'),
	makeapi = require('makeapi-client')({
		apiURL: "https://makeapi.webmaker.org"
	});

var visitedLinks = [],
	nodes        = [],
	connections  = [];

var getLinks = function(make, done){
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
				}
			});

			make.links = tmp;

			// fs.appendFile('tmp', JSON.stringify({
			// 	url: make.url,
			// 	links: make.links
			// }) + ',\n');
			// fs.appendFile('nodes', JSON.stringify({
			// 	name: make.title,
			// 	group: 0,
			// 	url: make.url
			// }) + ',\n');
			
			nodes.push({
				name: make.title,
				group: 0,
				connections: tmp,
				url: make.url,
				make: make
			});
			

			//tmp.forEach(function(link, i, a){
			function fetchNext() {
				var link = tmp.shift();
				if (! link ) if(done) return done();

				console.log('fetching', link);
				getMakeLinks(link, visitedLinks.indexOf(make.url), fetchNext);
			}
			fetchNext();

			//});
		}
	});
};

var getMakeLinks = function(url, target, done){
	if(visitedLinks.indexOf(url) === -1){
		makeapi.url(url).then(function(err, kit){
			if(err || kit.length === 0){
				console.log(err);
				if (done) done();
				return;
			}
			
			if(visitedLinks.indexOf(kit[0].url) === -1){
				visitedLinks.push(kit[0].url);

				// fs.appendFile('links', JSON.stringify({
				// 		source: visitedLinks.indexOf(kit[0].url), 
				// 		target: target || 0,
				// 		value: 10,
				// 		url: url
				// 	}) + ',\n');
				
				connections.push({
					source: visitedLinks.indexOf(kit[0].url),
					target: target || 0,
					value: 10,
					url: url
				});

				console.log('getting links for ', kit[0].url);
				getLinks(kit[0], done);
			}
		});
	}
	else {
		// do recheck for connections
		if (done) done();

		var tmp = {
			source: visitedLinks.indexOf(url),
			target: target || 0,
			value: 10,
			url: url
		};

		if(connections.indexOf(tmp) === -1){
			connections.push(tmp);
		}
	}
};

getMakeLinks(process.argv[2], null, function everythingIsDoneNow() {
	// write output json
	console.log('win');
	fs.writeFile('output.json', JSON.stringify({
		nodes: nodes,
		links: connections
	}));
});
