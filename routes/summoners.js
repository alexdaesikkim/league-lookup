/******************************************************************************
  Router to provide lookups of summoner's data

  Given username and region, it returns the number of times a summoner has
  played in each lane for the current season, and how many times they played
  a particular champion for each lane.

  If test is set to true, it uses existing json for testing.

  Author: Alex Kim
******************************************************************************/

var express = require('express');
var qs = require('querystring');
var request = require('request');
var router = express.Router();
const test_summoner_json = require('./summoner_json');
const test_matches_json = require('./matches_json');
const champions_json = require('./champions.json');
var test = false;

//for testing purposes
module.exports.test = test;

//variable key is set in such way: var key = "?api_key=<API KEY>"
const api_key = require('./api_key').key;

//helper functions
function idToName(id){
  return champions_json.data[id].name;
}

function parseData(matches, name){
  var lanes = {
    name: name,
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
    //Riot API's bug: If done by season total games is not accurate
    //need to manually calculate
    total: 0
  }

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
        else if(match.role === "DUO_SUPPORT"){
          lanes.support++;
          if(lanes.champions.support[champion]) lanes.champions.support[champion]++;
          else lanes.champions.support[champion] = 1;
        }
        /*
          Note: While looking through .json file, I came to realization that
          sorting between ADC and SUPPORT is NOT a trivial matter as there are
          some games tagged with "DUO" instead of "DUO_SUPPORT" or "DUO_CARRY".

          Upon further searching, some players had to come up with their own
          algorithms to pick out which lane a player has played in (maybe for
          previous seasons, or for the old draft mode without picking which
          role they decided to play).

          Thus, for the purposes of this task, I am leaving out "DUO" and only
          using the ones with tags.

          Next line is to decrease the total count only if match.role is "DUO"
        */
        else lanes.total--;

        break;
    }
    lanes.total++;
  });
  return lanes;
}

//grab account information from API
function getAccount(username, region, callback){
  if(test){
    account = test_summoner_json[username];
    console.log("Test, account grabbed from json.");
    callback(account);
    return;
  }

  var options ={
    url: 'https://'+region+'.api.riotgames.com/lol/summoner/v3/summoners/by-name/'+ username + api_key,
    method: 'GET'
  }

  request(options, function(error, response, body){
      if(!error && response.statusCode === 200){
        var return_json = JSON.parse(body);
        console.log("grabbed account data");
        callback(return_json);
      }
      else if(error){
        console.log(error);
        callback();
      }
      else{
        console.log("bad request");
        var return_json = JSON.parse(body);
        callback(return_json);
      }
    }
  );
}

//grab matches, return the parsed data
function getRecentMatches(region, accountId, name, callback){
  if(test){
    match_json = test_matches_json[accountId];
    console.log("Test, matches grabbed from json");
    if(match_json.status){
      callback(match_json);
    }
    else callback(parseData(match_json, name));
    return;
  }

  var options = {
    url: 'https://'+ region +'.api.riotgames.com/lol/match/v3/matchlists/by-account/' + accountId + api_key + '&queue=400&queue=420&queue=440&season=9',
    method: 'GET'
  }

  request(options, function(error, response, body){
    if(!error && response.statusCode === 200){
      callback(parseData(JSON.parse(body), name));
    }
    else if(error){
      console.log(error);
      callback(error);
    }
    else{
      console.log("bad request for matches");
      //should only return for 422. Very rarely, 404.
      callback(JSON.parse(body));
    }
  })
}

//router
router.get('/:region/:username/', function(req, res, next) {
  if(test){
    console.log("Test enabled. Using local json for username " + req.params.username);
  }
  console.log("Retrieving Data from region " + req.params.region+ " for user "+req.params.username);
  //note to self: async/await. is it better here?
  getAccount(req.params.username, req.params.region, function(account_data){
      if(account_data.status){
        if(account_data.status.status_code === 404){
          console.log("No user found");
        }
        else{
          console.log("API Call Error");
          console.log(account_data);
        }
        res.sendStatus(account_data.status.status_code);
      }
      else{
        getRecentMatches(req.params.region, account_data.accountId, account_data.name, function(match_data){
          if(match_data.status || match_data.total === 0){
            //will check match_data.total first, which avoids null status_code issue
            if(match_data.total === 0 || match_data.status.status_code === 422){
              console.log("422");
              res.sendStatus(422);
              return;
            }
            if(match_data.status.status_code === 404){
              console.log("404");
              res.sendStatus(404);
              //very rare case where account was made but no game was found. If it was 422 it would be different story
              //i.e. account_id: 240512585
              return;
            }
          }
          console.log("Finished Grabbing Matches");
          res.json(match_data);
        }
      )}
    }
  );
});

module.exports = router;
