var priority_json = require("./priority.json");

exports.getPriority = function(url){

	var val = -1;
	for (var key in priority_json) {
    if(url.indexOf(key) !== -1){
   		val = priority_json[key];
    }
	}
	return val;
};
