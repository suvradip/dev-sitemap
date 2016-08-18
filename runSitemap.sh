#!/bin/sh

a=0

while [ $a -lt 4265 ] #why 4265 ? because devcenter may be have 40K+ links.
do
   echo  "Iteration -- > " $a
   phantomjs sitemap.js http://www.fusioncharts.com/
   #phantomjs --remote-debugger-port=9000 sitemap.js http://www.fusioncharts.com/
   a=`expr $a + 1`
done