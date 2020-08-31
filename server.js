'use strict'
const express = require('express');
const { request, response } = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');

const PORT =  3030;
const app = express();
app.use(cors());

app.get('/location',locationSet);
// app.all('*',notFound);
// app.all('*',errorHandler);
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
            errorHandler('something went wrong in etting the data from locationiq web',req,res)
        })
        
}

 
// app.get('/location',(request,response) =>{
//     const loca = require(`./data/location.json`);
//     const cityName=request.query.city;
//     // console.log('Hi query',request.query)
//     let locationData = new Location (cityName,loca);
//     response.send(locationData);
// })

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
        let dataMap = data.body.data.map((item,idx)=>{
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
    

// let numbers = [2, 3, 4, 5];
// let weatherMap = weatherInfo.data.map((item,idx)=>{
//   let forecast = element.weather.description;
    // let time = element.datetime;
    // weatherArr.push(new Weather (forecast,time))
// });
};

// 404 error
// function notFound (error,request, response) {
//     response.status(404).send(error);
// };

// 500 error
// function errorHandler (error,request, response) {
//     response.status(500).send(error);
// };

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


app.listen(PORT,()=>{
    console.log(`Listening on PORT ${PORT}`);
})