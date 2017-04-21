/*
 *  How to run this program ?
 *  node sitemap.js
 */

/*jshint scripturl:true*/

var request,
    cheerio,
    domainName,
    GST,
    priority,
    path;

request = require("request");
cheerio = require('cheerio');
priority = require("./priority");
path = require('path'); 

GST = {};
GST.fs   = require('fs');

domainName = 'http://www.fusioncharts.com/';
GST.output_Dir = "output";
GST.linkArray = [domainName];
GST.counter = -1;
GST.init = false;
GST.pointer = 0;
GST.timer = "";
GST.retryCounter = 0;
GST.final_array = [];
GST.check_count = 0;
GST.log_status = 0;
GST.sitemap = (function(links){
  console.log('Generating sitemap');
  var data = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n<urlset xmlns=\"http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9\">",
      today = (new Date()).toISOString().slice(0,10);
     
  for(var i=0; i<links.length; i++){
    var link = links[i].split("&").join("&amp;").split(".com//").join(".com/");
    data = data + "\n    <url>";
    data = data + "\n        <loc>" + link + "</loc>";
    data = data + "\n        <lastmod>"+ today + "</lastmod>";
    data = data + "\n        <changefreq>weekly</changefreq>";
    data = data + "\n        <priority>"+priority.get(link)+"</priority>";
    data = data + "\n    </url>";
  }

  data = data + "\n</urlset>"; 
  GST.fs.writeFileSync('output/sitemap.xml', data);
}); //end of GST.sitemap

GST.createDir = (function(){
    if (!GST.fs.existsSync(GST.output_Dir)) {
       GST.fs.mkdirSync(GST.output_Dir);
    }
});

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

GST.readContents = (function(body){

 GST.log(102);
  var data;
  var links = [];
  //data= page.evaluate(function() {
    $ = cheerio.load(body);
    $('body').find('a').each(function() {
      var href = $(this).attr('href');
      if(GST.filterLink(href)) {
        href = href.split('#')[0];
        href = href.split('?PageSpeed=noscript')[0];
        href = href.split('&PageSpeed=noscript')[0];
        href = href.split("?replytocom=")[0];
        href = href.split("&replytocom=")[0];
        if (href.indexOf('/') === 0)
          href = domainName + href;
        if(href.charAt(href.length-1) !== "/")
          href = href + "/";

        links.push(href);
      }
    });

  
  if( links && links !== null ) {
    links = GST.removeDuplicate(links);
    var newData = [];
    newData = newData.concat(GST.linkArray);
    newData = newData.concat(links); 
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
  var flag = true,
      _m = url.match(/https?:\/\/www\.fusioncharts\.com\/blog\/([0-9\/]*)(.*)\/?$/);

  if(!url)
    return false;

  //this domain name allow
  if(url.indexOf('http://www.fusioncharts.com/') === -1)
    return false; 
  //this section is not allowed to index
  if(url.indexOf('http://www.fusioncharts.com/dev') !== -1)
    return false;
  if(url.indexOf('http://www.fusioncharts.com/blog/page/') !== -1)
    return false;
  //we are not indexing http://www.fusioncharts.com/blog/2013/4/ this type of links  
  if(typeof _m !== "undefined" && _m[1] !== "" && _m[2] === "" )
    return false;    
  //more types of url filtering
  if(url.indexOf('javascript:void(0)') !== -1)
    flag = false;
  if(typeof url === 'object')
    flag = false;
  if(url.indexOf('#') > -1)
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

  return flag;
});

GST.escapeLink = (function(string){

  if(!string)
  return false;  

  var flag = true;
  if(string.match(/\/maps\/spec-sheets\//))
  flag = false;
  else if (string.match(/\/maps\/marker-data\//))
  flag = false;
  else if (string.match(/attributeName=/))
  flag = false;
  else if (string.indexOf(".zip") !== -1)
  flag = false;
  else if (string.indexOf(".pdf") !== -1)
  flag = false;


  return flag;
}); // end of GST.escapeLink

GST.openLink = (function() {

  if(GST.log_status !== 105 ) { // Check whether the map generation is complete or not
    GST.setTimer(); 
    GST.counter += 1;

    if (GST.init && GST.counter >= GST.linkArray.length ) {
      GST.fs.writeFileSync('output/stack.json', JSON.stringify(GST.prepareStack(), null, 4));
      GST.log(108);
      GST.log(105);
      GST.log_status = 105;
    } 
      
    GST.init = true;

    GST.log(108);  
    if(GST.escapeLink(GST.linkArray[GST.counter])) {
      request(GST.linkArray[GST.counter], function (error, response, body) {
        if (!error && response.statusCode == 200) {
          GST.readContents(body);
        } else {
          //try to open a link 5 times, if fail then proceed to next link and log this link to a file
          if(GST.retryCounter < 5){
            GST.retryCounter +=1;
            GST.counter -= 1;
            GST.log(106);
            GST.clearTimer();
            setTimeout(function() {
                GST.openLink();
            }, 10000); 
          } else {
            GST.retryCounter = 0;
            console.log("discarding this link. :(");
            GST.fs.appendFileSync("output/retry.txt", "\n"+GST.linkArray[GST.counter]);
            GST.openLink();
          } 
        }
      });

    } else {
      GST.log(107);
      GST.openLink();
    }
  } else {
    GST.log(105);
  }   
}); // end of GST.openLink

// Check for the redirection of the url
GST.check_redirect = (function(url) {
  var redirect_url = url;
  var r = request.get(url, function (err, res, body) {
    if(!err && (res.statusCode === 301 || res.statusCode === 200 )){
      if(url !== r.uri.href){
        console.log("Redirection Found");
        //Log All the redirected Link
        GST.fs.appendFileSync('output/redirect_log.txt', "\n" + redirect_url + " --> " + r.uri.href + "\n");    
        redirect_url = r.uri.href ;
      }
    }
    else {
        GST.fs.appendFileSync('output/error_log.txt', "\n" + redirect_url); // Logging all the Error such as 404 , 403 etc. 
      }
    });
  GST.final_array.push(redirect_url);
});

GST.runProgram = (function(){

  var fileData;
  if (GST.fs.existsSync('output/stack.json'))
    fileData = GST.fs.readFileSync('output/stack.json', 'utf-8');
  
  if(fileData) { 
    fileData     = JSON.parse(fileData); 
    GST.counter   = fileData.pointer ;
    GST.pointer   = fileData.pointer;
    GST.linkArray = fileData.stack;
    GST.openLink();
  } else {
    GST.openLink();
  }

  //in every 15sec, url's file will be updated.
  setInterval(function(){
    console.log("file-write");
    GST.fs.writeFileSync('output/stack.json', JSON.stringify(GST.prepareStack(), null, 4));
  }, 15000);
  
  //Start the check for the redirection of url after 5 min
  setTimeout(function(){
    setInterval(function(){
    for(var key = GST.check_count ; key < GST.linkArray.length ; key++) {
      GST.check_count ++ ;
      GST.check_redirect(GST.linkArray[key]);
    }
    //Write into the Full_stack Json file
    GST.fs.writeFile('output/final_stack.json', JSON.stringify(GST.final_array ,null , 4));
    console.log("GST.final_array.length -> " + GST.final_array.length + "  length-|-  " + GST.linkArray.length + "  Pointer -|-  " + GST.pointer);
    //Termineate once complete
    if(GST.final_array.length == GST.linkArray.length && GST.log_status == 105) {
      GST.sitemap(GST.final_array);
      process.exit();
    }
  },60000);},60000);

}); // end of GST.runProgram

(function(){
  //To check for the output directory availbility
  GST.createDir();
  GST.runProgram();   
})();

