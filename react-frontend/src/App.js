/******************************************************************************
  Front-end React page for the application

  Given username and region, it returns a table with simple information for
  the summoner, particularly the number of times they played in each lane,
  and which champion was picked.

  App was created to alleviate looking up summoner's data within short period
  of time.

  Author: Alex Kim
******************************************************************************/
import React from 'react';
import './App.css';
import $ from 'jquery';

//testing purposes
const static_data = require('./api_returns.json');

var createReactClass = require('create-react-class');
var test = false;

var App = createReactClass({
  getInitialState(){
    return{
      top: 0,
      jungle: 0,
      mid: 0,
      adc: 0,
      support: 0,
      champions: '',
      match_number: 0,
      region: 'na1',
      region_name: 'NA',
      show: false,
      username: '',
      name: '',
      errorState: '',
      error: ''
    }
  },

  //event handler for username
  changeUsername(event){
    this.setState({
      username: event.target.value
    })
  },

  //helper functions
  changeRegion(event){
    var region_name;
    switch(event.target.id){
      case "br1": region_name = "BR"; break;
      case "eun1": region_name = "EUNE"; break;
      case "euw1": region_name = "EUW"; break;
      case "jp1": region_name = "JP"; break;
      case "kr": region_name = "KR"; break;
      case "la1": region_name = "LAN"; break;
      case "la2": region_name = "LAS"; break;
      case "na1": region_name = "NA"; break;
      case "oc1": region_name = "OCE"; break;
      case "tr1": region_name = "TR"; break;
      default: region_name = "RU"; break;

    }
    this.setState({
      region: event.target.id,
      region_name: region_name
    })
  },

  sortChampions(champions){
    //assuming that sorting size is small and list.sort is within n log n
    //if have time: priority queue?
    //note to self: setting array values != REFERENCING arrays
    var list = new Array(3);
    list[0] = ["", 0];
    list[1] = ["", 0];
    list[2] = ["", 0];
    var total = 0;
    for(var champion in champions){
      var count = champions[champion];
      for(var x = 0; x < 3; x++){
        if(count > list[x][1]){
          var y = 2;
          while(y > x){
            list[y][0] = list[y-1][0];
            list[y][1] = list[y-1][1];
            y--;
          }
          list[x][0] = champion;
          list[x][1] = champions[champion];
          x = 3;
        }
      }
      total = total + count;
    }
    var length = 0;
    //functional scope, but shouldn't matter
    //estlint-disable-next-line
    for(var x = 0; x < 3; x++){
      if(list[x][1] !== 0) length++;
    }
    if(length === 0){
      return "None";
    }
    list = list.map(function(champion){
      return champion[0] + " (" + (Math.round(champion[1] * 1000.0 / total)/10)+ "%), ";
    })
    var str = "";
    for(var i = 0; i < length; i++){
      str = str + list[i];
    }
    return str.slice(0, -2);
  },

  //ajax call
  expressCall(){
    var username = this.state.username;

    //assumption: A space counts as a character
    if(username === '' || username.length < 3 || username.length > 16){
      this.setState({
        errorState: 'alert alert-warning',
        error: 'Character has to be in-between 3 and 16 characters'
      })
    }
    else{
      if(test){
        var data = static_data[username];
        if(!data.status){
          this.setState({
            top: data.top,
            jungle: data.jungle,
            mid: data.mid,
            adc: data.adc,
            support: data.support,
            champions: data.champions,
            match_number: data.total,
            show: true,
            name: data.name,
            errorState: '',
            error: ''
          });
        }
        else{
          if(data.status === 404){
            this.setState({
              errorState: 'alert alert-danger',
              error: 'Could not find user "' + this.state.username + '" on region ' + this.state.region_name
            })
          }
          else if(data.status === 422){
            this.setState({
              errorState: 'alert alert-danger',
              error: 'No match data was found for user "' + this.state.username + '"'
            })
          }
          else{
            this.setState({
              errorState: 'alert alert-danger',
              error: 'Internal server error (API call returned with status ' + data.status + ')'
            })
          }
        }
      }
      else{
        var that = this;
        $.ajax({
          url: '/summoners/'+that.state.region+'/'+that.state.username,
          method: 'GET',
          success: function(data){
            that.setState({
              top: data.top,
              jungle: data.jungle,
              mid: data.mid,
              adc: data.adc,
              support: data.support,
              champions: data.champions,
              match_number: data.total,
              show: true,
              name: data.name,
              errorState: '',
              error: ''
            });
          },
          error: function(data){
            if(data.status === 404){
              that.setState({
                errorState: 'alert alert-danger',
                error: 'Could not find user "' + that.state.username + '" on region ' + that.state.region_name
              })
            }
            else if(data.status === 422){
              that.setState({
                errorState: 'alert alert-danger',
                error: 'No match data was found for user "' + that.state.username + '"'
              })
            }
            else{
              that.setState({
                errorState: 'alert alert-danger',
                error: 'Internal server error (API call returned with status ' + data.status + ')'
              })
            }
          }
        })
      }
    }
  },

  //forms
  displayTable(){
    if(this.state.show){
      return(
        <div>
          <div className="row justify-content-center">
            <br/>
            <h3>{this.state.name}&#39;s data for {this.state.match_number} games for this season on {this.state.region_name}</h3>
            <table className="table text-left">
              <thead>
                <tr>
                  <th>Role</th>
                  <th># of times Played</th>
                  <th>% of times Played</th>
                  <th>Most Played Champions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Top</th>
                  <td>{this.state.top}</td>
                  <td>{Math.round((this.state.top * 1000.0) / this.state.match_number)/10 + "%"}</td>
                  <td>{this.sortChampions(this.state.champions.top)}</td>
                </tr>
                <tr>
                  <th scope="row">Jungle</th>
                  <td>{this.state.jungle}</td>
                  <td>{Math.round((this.state.jungle * 1000.0) / this.state.match_number)/10 + "%"}</td>
                  <td>{this.sortChampions(this.state.champions.jungle)}</td>
                </tr>
                <tr>
                  <th scope="row">Mid</th>
                  <td>{this.state.mid}</td>
                  <td>{Math.round((this.state.mid * 1000.0) / this.state.match_number)/10 + "%"}</td>
                  <td>{this.sortChampions(this.state.champions.mid)}</td>
                </tr>
                <tr>
                  <th scope="row">ADC</th>
                  <td>{this.state.adc}</td>
                  <td>{Math.round((this.state.adc * 1000.0) / this.state.match_number)/10 + "%"}</td>
                  <td>{this.sortChampions(this.state.champions.adc)}</td>
                </tr>
                <tr>
                  <th scope="row">Support</th>
                  <td>{this.state.support}</td>
                  <td>{Math.round((this.state.support * 1000.0) / this.state.match_number)/10 + "%"}</td>
                  <td>{this.sortChampions(this.state.champions.support)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    }
    else{
      return(
        <div className="row text-center">
          <div className="col-12">
            Search the number of times the user has played a particular role on Summoners Rift, Draft Pick only.
            <br/>
            Only supports current season.
          </div>
        </div>
      )
    }
  },

  dropdownButtonForm(){
    return(
      <div className="col-12 col-md-6 col-lg-4">
        <div className="input-group">
          <div className="input-group-btn">
            <button type="button" id="dropdown" className="btn btn-danger dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              {this.state.region_name}
            </button>
            <div className="dropdown-menu">
              <div className="dropdown-item" id="br1" onClick={this.changeRegion}>BR</div>
              <div className="dropdown-item" id="eun1" onClick={this.changeRegion}>EUNE</div>
              <div className="dropdown-item" id="euw1" onClick={this.changeRegion}>EUW</div>
              <div className="dropdown-item" id="jp1" onClick={this.changeRegion}>JP</div>
              <div className="dropdown-item" id="kr" onClick={this.changeRegion}>KR</div>
              <div className="dropdown-item" id="la1" onClick={this.changeRegion}>LAN</div>
              <div className="dropdown-item" id="la2" onClick={this.changeRegion}>LAS</div>
              <div className="dropdown-item" id="na1" onClick={this.changeRegion}>NA</div>
              <div className="dropdown-item" id="oc1" onClick={this.changeRegion}>OCE</div>
              <div className="dropdown-item" id="tr1" onClick={this.changeRegion}>TR</div>
              <div className="dropdown-item" id="ru" onClick={this.changeRegion}>RU</div>
            </div>
          </div>
          <input type="text" className="form-control" onChange={this.changeUsername}></input>
        </div>
      </div>
    );
  },

  noticePane(){
    if(this.state.errorState !== ''){
      return(
        <div className={this.state.errorState + " text-center"} role='alert'>
          {this.state.error}
        </div>
      );
    }
  },

  render: function(){
    return (
      <div>
        <div className="App">
          <header className="App-header">
            <h1 className="App-title">Summoner Lookup</h1>
            <br/>
            <div className="row justify-content-center">
              {this.dropdownButtonForm()}
              <button className="btn btn-primary" id="submit" onClick={this.expressCall}>Search</button>
            </div>
            <br/>
          </header>
        </div>
        <div className="container">
          <div>
            {this.noticePane()}
          </div>
          <br/>
          <div>
            {this.displayTable()}
          </div>
        </div>
      </div>
    );
  }
});

export default App;
