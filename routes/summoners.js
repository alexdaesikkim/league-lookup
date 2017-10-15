var express = require('express');
var qs = require('querystring');
var request = require('request');
var router = express.Router();
var api_key = require('./api_key').key;
const test_summoner_json = require('./summoner_json');
const test_matches_json = require('./matches_json');
const champions_json = require('./champions.json');
var test = false;

const key = api_key.key;

//variable key is set in such way: var key = "?api_key=<API KEY>"

var region = '';
var accountId = 0;
var return_json = null;

function idToName(id){
  return champions_json.data[id].name;
}

function parseData(matches){
  var lanes = {
    top: 0,
    jungle: 0,
    mid: 0,
    adc: 0,
    support: 0,
    champions: {
      top: {},
      jungle: {},
      mid: {},
      adc: {},
      support: {}
    },
    total: 0
    //Riot API's bug: If done by season total games is not accurate
  }

  var champions = {};
  console.log("TESTING HEH");

  matches.matches.map(function(match){
    var lane = match.lane;
    var champion = idToName(match.champion);
    switch(lane){
      case "TOP":
        lanes.top++;
        if(lanes.champions.top[champion]) lanes.champions.top[champion]++;
        else lanes.champions.top[champion] = 1;
        break;
      case "JUNGLE":
        lanes.jungle++;
        if(lanes.champions.jungle[champion]) lanes.champions.jungle[champion]++;
        else lanes.champions.jungle[champion] = 1;
        break;
      case "MID":
        lanes.mid++;
        if(lanes.champions.mid[champion]) lanes.champions.mid[champion]++;
        else lanes.champions.mid[champion] = 1;
        break;
      default:
        if(match.role === "DUO_CARRY"){
          lanes.adc++;
          if(lanes.champions.adc[champion]) lanes.champions.adc[champion]++;
          else lanes.champions.adc[champion] = 1;
        }
        else {
          lanes.support++;
          if(lanes.champions.support[champion]) lanes.champions.support[champion]++;
          else lanes.champions.support[champion] = 1;
        }
        break;
    }
    lanes.total++;
  });
  return lanes;
}

function getAccountId(username, region, callback){
  if(test){
    accountId = test_summoner_json.accountId;
    console.log("Test, accountid grabbed from json. Account ID is " + accountId)
    getRecentMatches("na1", function(){
      callback();
    });
    return;
  }

  var options ={
    url: 'https://'+region+'.api.riotgames.com/lol/summoner/v3/summoners/by-name/'+ username + api_key,
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
        return_json = JSON.parse(body);
        console.log(options.url);
        console.log(return_json)
        callback();
      }
    }
  );
}

function getRecentMatches(region, callback){
  if(test){
    match_json = test_matches_json;
    console.log("Test, matches grabbed from json");
    return_json = parseData(match_json);
    callback();
    return;
  }

  var options = {
    url: 'https://'+ region +'.api.riotgames.com/lol/match/v3/matchlists/by-account/' + accountId + api_key + '&queue=400&queue=420&queue=440&season=9',
    method: 'GET'
  }

  request(options, function(error, response, body){
    if(!error && response.statusCode === 200){
      console.log("grabbed matches");
      return_json = parseData(JSON.parse(body));
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
  if(test){
    getAccountId("supernovamaniac", "na1", function(){
      console.log("Test finished");
      res.json(return_json);
      return_json = null;
      res.end();
    })
    return;
  }
  console.log("Retrieving Data from region " + req.params.region+ " for user "+req.params.username);
  //note to self: look at async/await and try to adopt that. this code, while functional, just looks terrible to look at
  getAccountId(req.params.username, req.params.region, function(){
      if(return_json){
        res.json(return_json);
        return_json = null;
        res.end();
      }
      else{
        getRecentMatches(req.params.region, function(){
          console.log("Finished Grabbing Matches");
          res.json(return_json);
          return_json = null;
          res.end();
        }
      )}
    }
  );
});

module.exports = router;
