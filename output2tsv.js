// get json
var fs = require('fs');
var output = fs.readFileSync('output.json', {encoding:'utf8'});
output = JSON.parse(output);

// get tag frequency
var tags = [];

output.nodes.forEach(function(node, idx, arry){
	node.make.rawTags.forEach(function(tag, i, a){
		tag = tag.toLowerCase()
		var foundFlag = false;
		tags.forEach(function(tagObj, index, ary){
			if(tagObj.name == tag){
				foundFlag = true;
				tagObj.count++;
			}
		});

		if(foundFlag === false){
			tags.push({
				name: tag,
				count: 1
			});
		}
	});
});

fs.appendFileSync('output.tsv', 'letter	frequency\n');
tags.forEach(function(tag, i, a){
	fs.appendFile('output.tsv', tag.name + '	' + tag.count + '\n');
});