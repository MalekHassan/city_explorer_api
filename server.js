'use strict'
const express = require('express');
const { request, response } = require('express');
require('dotenv').config();
const cors = require('cors');

const superagent = require('superagent');

const PORT = process.env.PORT || 3030;
// const PORT =  3030;
const app = express();
app.use(cors());

app.get('/location',locationSet);
function locationSet(request,response){
        const cityName=request.query.city;
        // console.log('Hi query',request.query)
        let key=process.env.LOCATION_KEY;
        const url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json` 
         superagent.get(url)
         .then(data =>{
            let locationData = new Location (cityName,data.body);            
            response.send(locationData);
         })
         .catch(()=>{
        errorHandler()
    })
}

app.get('/weather', weatherFunc);
function weatherFunc ( req , res) {
    let weatherArr = []
    const cityData = req.query.search_query;
    const latit = req.query.latitude;
    const long = req.query.longitude;
    // console.log(cityData)
    // console.log('latitude',latit)
    // const weatherInfo = require('./data/weather.json');
    // console.log(weatherInfo);
    let weatherKey = process.env.WEATHER_KEY;
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${cityData}&lat=${latit}&lon=${long}&key=${weatherKey}`
    console.log("weatherkey" , url);
     superagent.get(url)
    .then(data =>{
        //  console.log(data.body);
        // let weatherArr = [];
        // console.log('this is data',data)
        data.body.data.map((item,idx)=>{
        // let weatherArr = [];
            // if (idx <= 7) {
               const weatherat = new Weather (item)
               weatherArr.push(weatherat);
            // }
            // console.log(weatherat);
            // return weatherat
        });
                    // console.log(weatherArr);
                    res.send(weatherArr);

    })
};


app.get('/trials', trialsFunc);
function trialsFunc ( req , res) {
    let trailsArr = [];
// const cityName = req.query.search_query;
const lat = req.query.latitude;
const lon = req.query.longitude;

let trailKey = process.env.TRIALE_API_KEY;
const url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=10&key=${trailKey}`
superagent.get(url)
.then(datas => {
    console.log(datas.body.trails);
datas.body.trails.map((item) => {
    const trailsItem = new Trails (item);
    trailsArr.push(trailsItem);
})
res.send(trailsArr);
})
}

// 404 error
app.all('*', (request, response) => {
    let status = 404;
    response.status(status).send('Not Found');
});

// 500 error
app.all('*', (request, response) => {
    let status = 500;
    response.status(status).send('Internal server error');
});




function Weather(item){
    
       this.forecast=item.weather.description;
       this.time=item.datetime;
    
}

function Location(cityName,loca){
    this.search_query=cityName;
    this.formatted_query=loca[0].display_name;
    this.latitude=loca[0].lat;
    this.longitude=loca[0].lon;
}

function Trails(data){
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

app.listen(PORT,()=>{
    console.log(`Listening on PORT ${PORT}`);
})