var prioritylist = require("./priority.json");

exports.get = function(url){

	var val;
	for (var key in prioritylist) {
    if(url.indexOf(key) !== -1){
   		val = prioritylist[key];
      break;
    }
	}
  if(!val && typeof val == "undefined")
    return 0.7;
  else
    return val;
};
