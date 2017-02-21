#!/bin/bash

trap "exit" SIGHUP SIGINT SIGTERM

if [[ ! ${ais_user:+1} ]]; then echo "variable 'ais_user' not set"; exit 1; fi


jsonoutput=/data/aishub
if [[ ${ais_json:+1} ]]; then jsonoutput=${ais_json}; fi

# default get 3h of AIS data
timewindow=-1
if [[ ${ais_window:+1} ]]; then timewindow=${ais_window}; fi

# AISHub limits to 1 call per minute 
interval=60
if [[ ${ais_interval:+1} ]]; then interval=${ais_interval}; fi

hours=$((timewindow / 3600))
echo "Downloading ${hours}h of AIS data..."

iterations=$((timewindow / interval))
urliteration=0
ais_url = "ais"
ais_url1="http://data.aishub.net/ws.php?username=${ais_user}&format=1&output=json&latmin=51.04139389812637&latmax=54.648412502316695&lonmin=2.548828125&lonmax=10.52490234375"
ais_url2="http://data.aishub.net/ws.php?username=${ais_user}&format=1&output=json&latmin=18.372773&latmax=38.803330&lonmin=-98.041992&lonmax=-75.893555"
ais_url3="http://data.aishub.net/ws.php?username=${ais_user}&format=1&output=json&latmin=31.904376&latmax=42.705650&lonmin=113.444824&lonmax=130.935059"
for (( c=1; c<=$iterations; c++ ))
do

if [[ $urliteration == 0 ]]; then ais_url=${ais_url1}; fi
if [[ $urliteration == 1 ]]; then ais_url=${ais_url2}; fi
if [[ $urliteration == 2 ]]; then ais_url=${ais_url3}; fi
  echo "$c / $iterations:"
  echo "  Requesting AIS data..."
  _tmpfile=_tmp.json 
curl -s -o $_tmpfile $ais_url > /dev/null;

  
  _now=$(date +"%Y_%m_%d_%H_%M_%S")
  _file="${jsonoutput}_${_now}.json"
  echo "  Transforming to '${_file}'..."
  jq -c -f filter.jq $_tmpfile > ${_file}

  echo "  Waiting ${interval} seconds..."
  
  urliteration=$((urliteration+1))
  echo $urliteration
  urliteration=$(($urliteration%3))
  sleep ${interval}
done

