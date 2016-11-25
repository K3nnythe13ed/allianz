#!/bin/bash

trap "exit" SIGHUP SIGINT SIGTERM

if [[ ! ${ais_user:+1} ]]; then echo "variable 'ais_user' not set"; exit 1; fi
ais_url="http://data.aishub.net/ws.php?username=${ais_user}&format=1&output=json&latmin=51.361492&latmax=55.584555&lonmin=2.337891&lonmax=10.430420"


jsonoutput=/data/aishub
if [[ ${ais_json:+1} ]]; then jsonoutput=${ais_json}; fi

# default get 2h of AIS data
timewindow=7200
if [[ ${ais_window:+1} ]]; then timewindow=${ais_window}; fi

# AISHub limits to 1 call per minute 
interval=60
if [[ ${ais_interval:+1} ]]; then interval=${ais_interval}; fi

hours=$((timewindow / 3600))
echo "Downloading ${hours}h of AIS data..."

iterations=$((timewindow / interval))
for (( c=1; c<=$iterations; c++ ))
do
  echo "$c / $iterations:"
  echo "  Requesting AIS data..."
  _tmpfile=_tmp.json 
  curl -s -o $_tmpfile $ais_url > /dev/null
  
  _now=$(date +"%Y_%m_%d_%H_%M_%S")
  _file="${jsonoutput}_${_now}.json"
  echo "  Transforming to '${_file}'..."
  jq -c -f filter.jq $_tmpfile > ${_file}

  echo "  Waiting ${interval} seconds..."
  sleep ${interval}
done

