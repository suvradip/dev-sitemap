#!/bin/sh

a=0

while [ $a -lt 4265 ] #why 4265 ? because devcenter may be have 40K+ links.
do
   echo  "Iteration -- > " $a
   phantomjs sitemap.js http://127.0.0.1:4000/paradocs/jekyll/out/
   a=`expr $a + 1`
done