/*
 *  How to run this program ?
 *  sh ./runSitemap.sh

 *  Why are we using shell scripts to run this program ?
 *  Because phantomJs maybe crash after opening the 200+ links. so to avoid this situation we are just breaking the 
 *  link stack and parsing the each link. 
 *
 *  Dev center may be have 38,000K links
 *  require phantomjs v1.9.8
 */

/*jshint scripturl:true*/

var GST= {};

page = require('webpage').create();
GST.fs   = require('fs');
phantom.onError = function(){};
// ignoring all console log of the site
page.onConsoleMessage = (function(msg) {
  //console.log("nothing to print.");
});

// ignoring all javascript error of the site
page.onError = (function(msg) {
  //console.log("Nothing to print.");
});

// ignoring all javascript alert of the page
page.onAlert = (function(msg) {
  //console.log("Nothing to print.");
});


GST.linkArray = [];
GST.counter = -1;
GST.init = false;
GST.pointer = 0;
GST.timer = "";

GST.sitemap = (function(links){
  console.log('here');
  var data = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n<urlset xmlns=\"http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9\">",
      today = (new Date()).toISOString().slice(0,10);
     
  for(var i=0; i<links.length; i++){
    data = data + "\n    <url>";
    data = data + "\n        <loc>" + links[i].split("&").join("&amp;").split(".com//").join(".com/") + "</loc>";
    data = data + "\n        <lastmod>"+ today + "</lastmod>";
    data = data + "\n        <changefreq>daily</changefreq>";
    data = data + "\n        <priority>0.7</priority>";
    data = data + "\n    </url>";
  }

  data = data + "\n</urlset>"; 
  GST.fs.write('output/sitemap.xml', data);
}); //end of GST.sitemap

GST.log = (function(code){

  switch(code) {
    case 101 :
      console.log('Test Line of Code.');          
    break;

    case 102:
      console.log(" Openning "+ (GST.counter + 1) +" link " + GST.linkArray[GST.counter] + " **");
    break;

    case 103:
      console.log('Finished ..');
    break;

    case 104:
      console.log('Retrying ..');
    break;

    case 105:
      console.log('*** sitemap generation finished. Please terminate the program. press ctrl+C ***'); 
    break;

    case 106:
      console.log("** Link cannot be opened may be broken, will retry now **");
    break;

    case 107:
      console.log('Escaping : ' + GST.linkArray[GST.counter]);
    break;

    case 108:
      console.log('\n-- Stack length --> '+ GST.linkArray.length +' -- pointer --> ' + GST.counter + ' ---');
    break;

    case 109:
      console.log("** URL must be specified **");
    break;

  }
}); //end of GST.log

GST.prepareStack = (function(){

  var obj = {};
  obj.pointer = GST.counter - 1;
  obj.stack = GST.linkArray;
  return obj;
}); // end of GST.prepareStack

GST.removeDuplicate = (function(currentData){

  var uniqLinks = [];
  for(var i=0; i<currentData.length; i++) {
    var current = currentData[i];
    if(uniqLinks.indexOf(current) < 0)
    uniqLinks.push(current);
  } 

  return uniqLinks;  
}); //end of GST.removeDuplicate

GST.setTimer = (function() {

  GST.clearTimer();
  GST.timer = setTimeout(function(){ 
  GST.counter -=1;  
  GST.openLink(); 
  }, 25000);
}); // end of GST.setTimer

GST.clearTimer = (function() {

  clearTimeout(GST.timer);
}); // end of GST.clearTimer

GST.readContents = (function(fcobj){

 GST.log(102);
  var data,
  	  filterLinks = [];
  data= page.evaluate(function() {
    var anchors = document.getElementsByTagName('a'), 
    index, 
    href,
    links = [];

    for(index=0; index<anchors.length; index++) {
      href = anchors[index].href;
      
      // if(href !== "" && href !== 'javascript:void(0)' && typeof href !== 'object' &&
      //  href.indexOf('http://127.0.0.1:4000/paradocs/jekyll/out/') > -1 && href.indexOf('.html#') === -1) 
     if(href !== "" && href !== 'javascript:void(0)' && typeof href !== 'object') 
        links.push(href);
    } //end of for loop*/

    return links;
  });
  
  //console.log(data.length);
  
  if( data && data !== null ) {
  	for(var _i =0; _i <= data.length; _i++) {  		
  		if(GST.filterLink(data[_i]))
  			filterLinks.push(data[_i]);
  	}
  	console.log(data.length, filterLinks.length);
    //data = GST.removeDuplicate(data);
    data = GST.removeDuplicate(filterLinks);

    var newData = [];
    newData = newData.concat(GST.linkArray);
    newData = newData.concat(data); 
    GST.linkArray = GST.removeDuplicate(newData);
    GST.log(103);
    GST.clearTimer();
    GST.openLink();
  } else {
    GST.log(104);
    GST.clearTimer();
    GST.counter -=1;
    GST.openLink();
  }
}); //end of GST.readContent

GST.filterLink = (function(url){
  var flag = true;

  if(!url)
    return false;

  if(url.indexOf('http://127.0.0.1:4000/paradocs/jekyll/out/') === -1)
  	flag = false;
  
  // if(url.indexOf('.html#') > -1)
  // 	flag = false;
  
  if (url.match(/&?attributeName=/))
  	flag = false;

  if(url.indexOf('mailto') > -1)
    flag = false;
  if(url.indexOf('?q=') > -1)
    flag = false;

  //filter files
  if(url.indexOf('.json') > -1)
    flag = false;
  if(url.indexOf('.xml') > -1)
    flag = false;
  if(url.indexOf('.gif') > -1)
    flag = false;
  if(url.indexOf('.tif') > -1)
    flag = false;
  if(url.indexOf('.eps') > -1)
    flag = false;
  if(url.indexOf('.jpg') > -1)
    flag = false;
  if(url.indexOf('.png') > -1)
    flag = false;
  if(url.indexOf('.zip') > -1)
    flag = false;

  //console.log(url, flag);
  return flag;
});


GST.escapeLink = (function(string){

  if(!string)
  return false;  

  //console.log(string);	
  var flag = true;
  if(string.match(/\/maps\/spec-sheets\//))
  flag = false;
  if (string.match(/\/maps\/marker-data\//))
  flag = false;
  if (string.match(/&?attributeName=/))
  flag = false;
  if(string.match(/chart-attributes.html\?chart=/))
  flag = false;
  if(string.indexOf('.html#') > -1)
  flag = false;	
 // console.log(string, flag);	
  return flag;
}); // end of GST.escapeLink

GST.openLink = (function() {

  GST.setTimer(); 
  GST.counter += 1;

  if (GST.init && GST.counter >= GST.linkArray.length ) {
    GST.sitemap(GST.linkArray);
    GST.fs.write('output/stack.json', JSON.stringify(GST.prepareStack(), null, 4));
    GST.log(108);
    GST.log(105);
    phantom.exit();
  } 
    
  GST.init = true;

 if(GST.counter === (GST.pointer + 10)) {
    GST.fs.write('output/stack.json', JSON.stringify(GST.prepareStack(), null, 4));
    phantom.exit();
 } 

  GST.log(108);  
  if(GST.escapeLink(GST.linkArray[GST.counter])) {
    page.open(GST.linkArray[GST.counter], function(status) {
      if (status == 'success') {
          GST.readContents();
      } else {
          GST.counter -= 1;
          GST.log(106);
          GST.clearTimer();
          setTimeout(function() {
              GST.openLink();
          }, 10000);      
      } //end of if condition
    }); //end page.open
  } else {
    GST.log(107);
    GST.openLink();
  }   
}); // end of GST.openLink

GST.runProgram = (function(){

  var fileData;
  if (GST.fs.exists('output/stack.json'))
    fileData = GST.fs.read('output/stack.json');

  if(fileData) { 
    fileData     = JSON.parse(fileData); 
    GST.counter   = fileData.pointer ;
    GST.pointer   = fileData.pointer;
    GST.linkArray = fileData.stack;
    GST.openLink();
  } else {
    GST.openLink();
  }
}); // end of GST.runProgram

GST.grabCommandLine = (function(){

  var system = require('system');

  if(typeof system.args[1] =="undefined") {
      GST.log(109);
      phantom.exit();
  } else {
      GST.linkArray.push(system.args[1]);
  }    
}); //end of GST.grabCommandLine


(function(){
  GST.grabCommandLine ();  
  GST.runProgram();   
})();

