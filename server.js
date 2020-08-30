'use strict'
const express = require('express');
require('dotenv').config();

const PORT = process.env.PORT || 3030;
const app = express();

app.get('/location',(request,response) =>{
    const loca = require(`./data/location.json`);
    const cityName=request.query.city;
    let locationData = new Location (cityName,loca);
    response.send(locationData);
})

function Location(cityName,loca){
    this.search_query=cityName;
    this.formatted_query=loca[0].display_name;
    this.latitude=loca[0].lat;
    this.longitude=loca[0].lon;
}


app.listen(PORT,()=>{
    console.log(`Listening on PORT ${PORT}`);
})