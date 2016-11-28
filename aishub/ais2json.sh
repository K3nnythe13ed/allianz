#!/bin/bash

trap "exit" SIGHUP SIGINT SIGTERM

if [[ ! ${ais_user:+1} ]]; then echo "variable 'ais_user' not set"; exit 1; fi
ais_url="http://data.aishub.net/ws.php?username=${ais_user}&format=1&output=json&latmin=51.04139389812637&latmax=54.648412502316695&lonmin=2.548828125&lonmax=10.52490234375"


jsonoutput=/data/aishub
if [[ ${ais_json:+1} ]]; then jsonoutput=${ais_json}; fi

# default get 3h of AIS data
timewindow=10800
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

