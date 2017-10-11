var express = require('express');
var qs = require('querystring');
var request = require('request');
var router = express.Router();
var api_key = require('./api_key');
const key = api_key.key;
//variable key is set in such way: var key = "?api_key=<API KEY>"

var region = '';
var accountId = 0;
var json = null;

function getAccountId(username, region, callback){

  var options ={
    url: 'https://'+region+'.api.riotgames.com/lol/summoner/v3/summoners/by-name/'+username + key,
    method: 'GET'
  }

  request(options, function(error, response, body){
      if(!error && response.statusCode === 200){
        var r = JSON.parse(body);
        accountId = r.accountId;
        console.log("grabbed account id");
        callback();
      }
      else if(error){
        console.log(error);
        callback();
      }
      else{
        console.log("bad request");
        json = JSON.parse(body);
        callback();
      }
    }
  );
}

function getRecentMatches(region, callback){
  var options = {
    url: 'https://'+ region +'.api.riotgames.com/lol/match/v3/matchlists/by-account/' + accountId + '/recent' + key,
    method: 'GET'
  }

  request(options, function(error, response, body){
    if(!error && response.statusCode === 200){
      console.log("grabbed matches");
      json = JSON.parse(body);
      callback();
    }
    else if(error){
      console.log(error);
      callback();
    }
    else{
      console.log("bad request for matches");
      //theoretically shouldn't happen because given correct ID, it should return null array
      callback();
    }
  })
}

router.get('/:region/:username/', function(req, res, next) {
  console.log("Retrieving Data from region " + req.params.region+ " for user "+req.params.username)
  //note to self: look at async/await and try to adopt that. this code, while functional, just looks terrible to look at
  getAccountId(req.params.username, req.params.region, function(){
    console.log(json);
      if(json){
        res.json(json);
        json = null;
        res.end();
      }
      else{
        getRecentMatches(req.params.region, function(){
          console.log("Finished Grabbing Matches");
          res.json(json);
          json = null;
          res.end();
        }
      )}
    }
  );
});

module.exports = router;
