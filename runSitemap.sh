#!/bin/sh

a=0

while [ $a -lt 4265 ] #why 4265 ? because devcenter may be have 40K+ links.
do
   echo  "Iteration -- > " $a
   phantomjs sitemap.js http://www.fusioncharts.com/dev/
   a=`expr $a + 1`
done