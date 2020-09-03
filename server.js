"use strict";
require("dotenv").config();
const express = require("express");
const { request, response } = require("express");
const cors = require("cors");
const superagent = require("superagent");
const pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL);

const PORT = process.env.PORT || 3030;
// const PORT =  3030;
const app = express();
app.use(cors());

let sdRegion = [];

app.get("/location", locationSet);

async function locationSet(request, response) {
  const cityName = request.query.city;
  let dataserver = await getServerData(cityName);
  console.log(dataserver);
  // console.log('');
  if (dataserver.length === 0) {
    console.log("from API");
    response.send(await getApiData(cityName));
  } else {
    console.log("from database ");
    response.send(dataserver[0]);
  }

  // console.log("hi", serverDa);
}
function getServerData(cityName) {
  let sql = `SELECT * FROM location WHERE search_query=$1;`;

  let values = [cityName];

  return client.query(sql, values).then((result) => {
    return result.rows;
  });
}

function getApiData(cityName) {
  let key = process.env.LOCATION_KEY;
  const url = `https://api.locationiq.com/v1/autocomplete.php?key=${key}&q=${cityName}`;
  return superagent.get(url).then((data) => {
    let locationData = new Location(cityName, data.body);
    saveDataToDB(locationData);
    return locationData;
  });
}
function saveDataToDB(data) {
  let sql = `INSERT INTO location (search_query,formatted_query,latitude,longitude) VALUES ($1,$2,$3,$4)`;
  let values = [
    data.search_query,
    data.formatted_query,
    data.latitude,
    data.longitude,
  ];
  client.query(sql, values).then((datas) => {
    console.log("insearing");
  });
}

app.get("/weather", weatherFunc);
function weatherFunc(req, res) {
  let weatherArr = [];
  const cityData = req.query.search_query;
  const latit = req.query.latitude;
  const long = req.query.longitude;
  // console.log(cityData)
  // console.log('latitude',latit)
  // const weatherInfo = require('./data/weather.json');
  // console.log(weatherInfo);
  let weatherKey = process.env.WEATHER_KEY;
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${cityData}&lat=${latit}&lon=${long}&key=${weatherKey}`;
  console.log("weatherkey", url);
  superagent.get(url).then((data) => {
    //  console.log(data.body);
    // let weatherArr = [];
    // console.log('this is data',data)
    data.body.data.map((item, idx) => {
      // let weatherArr = [];
      // if (idx <= 7) {
      const weatherat = new Weather(item);
      weatherArr.push(weatherat);
      // }
      // console.log(weatherat);
      // return weatherat
    });
    // console.log(weatherArr);
    res.send(weatherArr);
  });
}

app.get("/trails", trialsFunc);
function trialsFunc(req, res) {
  let trailsArr = [];
  const cityName = req.query.search_query;
  const lat = req.query.latitude;
  const lon = req.query.longitude;

  let trailKey = process.env.TRIALE_API_KEY;
  const url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&key=${trailKey}`;
  console.log('url',url);
  superagent.get(url).then((datas) => {
    // console.log(datas.body.trails);
    datas.body.trails.map((item) => {
      const trailsItem = new Trails(item);
      trailsArr.push(trailsItem);
    });
    res.send(trailsArr);
  });
}
app.get("/movies", getMoviesFun);

async function getMoviesFun(req, res) {
  const cityName = req.query.search_query;
  // console.log("cityName", cityName);
  let regions = await getRegion(cityName);
  console.log(regions);
  let moviesR = [];
  let movieKey = process.env.MOVIE_API_KEY;
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${movieKey}&region=${regions.region}`;
  console.log(url)
  superagent.get(url).then((data) => {
    // console.log(data.body);
    data.body.results.map((item, idx) => {
      let movies = new Movies(item);
      // console.log(movies);
      moviesR.push(movies);
    });
    res.send(moviesR);
  });
}
function getRegion(cityName) {
  let key = process.env.LOCATION_KEY;
  const url = `https://api.locationiq.com/v1/autocomplete.php?key=${key}&q=${cityName}`;
  return superagent.get(url).then((data) => {
    let locationData = new Region(data.body);
    return locationData;
  });
}
app.get("/yelp", getYelp);
async function getYelp(request, response) {
  const cityName = request.query.search_query;
  let regions = await getRegion(cityName);
  let lat = regions.latitude;
  let lon = regions.longitude;
  let yelparr = [];
  const YELP_API_KEY = process.env.YELP_API_KEY;
  let url = "https://api.yelp.com/v3/businesses/search";
  let queryParams = {
    term: "restaurants",
    latitude: lat,
    longitude: lon,
  };
  superagent
    .get(url)
    .query(queryParams)
    .set("Authorization", `Bearer ${YELP_API_KEY}`)
    .then((data) => {
      // console.log(response)
      // console.log(response.body.businesses)
      data.body.businesses.map((e) => {
        let yelpda = new Yelp(e);
        console.log(yelpda);
        yelparr.push(yelpda);
        // console.log(yelparr);
      });
      response.send(yelparr);
    });
  // console.log(yelparr);

}

// 404 error
app.all("*", (request, response) => {
  let status = 404;
  response.status(status).send("Not Found");
});

// 500 error
app.all("*", (request, response) => {
  let status = 500;
  response.status(status).send("Internal server error");
});

function Weather(item) {
  this.forecast = item.weather.description;
  this.time = item.datetime;
}

function Location(cityName, loca) {
  this.search_query = cityName;
  this.formatted_query = loca[0].display_name;
  this.latitude = loca[0].lat;
  this.longitude = loca[0].lon;
}

function Trails(data) {
  this.name = data.name;
  this.location = data.location;
  this.lenght = data.length;
  this.stars = data.stars;
  this.star_votes = data.starVotes;
  this.summary = data.summary;
  this.trail_url = data.url;
  this.conditions = data.conditionDetails;
  let day = new Date(data.conditionDate);
  this.condition_date = day.toLocaleDateString();
  this.condition_time = day.toLocaleTimeString("en-US");
}
function Movies(data) {
  this.title = data.title;
  this.overview = data.overview;
  this.average_votes = data.vote_average;
  this.total_votes = data.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
  this.popularity = data.popularity;
  this.released_on = data.release_date;
}
function Yelp(data) {
  this.name = data.name;
  this.image_url = data.image_url;
  this.price = data.price;
  this.rating = data.rating;
  this.url = data.url;
}
function Region(loca) {
  this.region = loca[0].address.country_code.toUpperCase();
  this.latitude = loca[0].lat;
  this.longitude = loca[0].lon;
  sdRegion.push(this);
}

client.connect(() => {
  app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
  });
});
