# docker-elk-Riskmap

This is a synchronized fork of [awesome-inc/docker-elk](https://github.com/awesome-inc/docker-elk).

This is a use case of the ELK stack to assess the insurance risk of cargo vessels and warehouses with respect to spatial, temporal and weather data. 

Technically, this comprises the [Elastic Stack](https://www.elastic.co/products) and a [Leaflet](http://leafletjs.com/) web application to visualize [OpenWeatherMap](https://openweathermap.org/) and playback of online [AIS](https://en.wikipedia.org/wiki/Automatic_identification_system) data.

![Screenshot](riskmap.jpg)

## Setup

1. Install [docker](http://docker.io).
2. Install [docker-compose](http://docs.docker.com/compose/install/).
3. Clone this repository recursively (i.e. including submodules)

## Usage

Start your stack using *docker-compose*:

    docker-compose up

Alternatively, use [Vagrant](https://www.vagrantup.com/)

    vagrant up

And then access the web application hitting [http://localhost:8080](http://localhost:8080) with a web browser.

You will see some test data. Optionally, for online import of AIS data, set your [AISHub username](http://www.aishub.net/xml-description-20.php) before starting the stack, i.e.

  - on Linux: `export ais_user=[AISHUB_Username]`
  - on Windows: `set ais_user=[AISHUB_Username]`

