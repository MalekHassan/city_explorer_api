'use strict'
const express = require('express');
const { request, response } = require('express');
require('dotenv').config();
const cors = require('cors');

const PORT = process.env.PORT || 3030;
const app = express();
app.use(cors());
app.get('/location',(request,response) =>{
    const loca = require(`./data/location.json`);
    const cityName=request.query.city;
    // console.log('Hi query',request.query)
    let locationData = new Location (cityName,loca);
    response.send(locationData);
})

app.get('/weather',(request,response)=>{
    const dataFile=require(`./data/weather.json`);
    let dataArray=[];
    // const weteherQuery=request.query.city;
    dataFile.data.forEach(item => {
    let weatherData= new Weather(item);
    // console.log('item',item)
    dataArray.push(weatherData);
    // console.log("hello",weatherData)
    })
    response.send(dataArray);   
})

// 404 error
app.all('*', (request, response) => {
    response.status(404).send(`status: 404,${'<br>'}responseText: "The server can not find the requested resource"`);
});

// 500 error
app.all('*', (request, response) => {
    response.status(500).send(`status:500,${'<br>'}responseText:"The server has encountered a situation it doesn't know how to handle."`);
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


app.listen(PORT,()=>{
    console.log(`Listening on PORT ${PORT}`);
})