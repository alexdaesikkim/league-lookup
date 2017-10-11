//eslint-disable-next-line
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import $ from 'jquery';

var createReactClass = require('create-react-class');

var App = createReactClass({
  getInitialState(){
    return{
      roles: [0,0,0,0,0],
      region: 'na1',
      region_name: 'NA',
      show: false,
      username: '',
      name: '',
      errorState: '',
      error: ''
    }
  },

  changeUsername(event){
    this.setState({
      username: event.target.value
    })
  },

  noticePane(){
    if(this.state.errorState !== ''){
      return(
        <div className={this.state.errorState} role='alert'>
          {this.state.error}
        </div>
      );
    }
  },

  updateRoles(json){
    var newRoles = [0,0,0,0,0];
    var name = this.state.username;
    console.log(json);
    json.map(function(match){
      var lane = match.lane;
      switch(lane){
        case "TOP":
          newRoles[0]++;
          break;
        case "JUNGLE":
          newRoles[1]++;
          break;
        case "MID":
          newRoles[2]++;
          break;
        case "BOTTOM":
          if(match.role === "DUO_CARRY") newRoles[3]++;
          else newRoles[4]++;
          break;
      }
    });
    this.setState({
      roles: newRoles,
      show: true,
      name: name,
      errorState: '',
      error: ''
    });
  },

  expressCall(){
    var username = this.state.username;
    //assumption: A space counts as a character
    //TODO: regexp to filter out anything not alphabetical
    if(username === '' || username.length < 3 || username.length > 16){
      this.setState({
        errorState: 'alert alert-warning',
        error: 'Character has to be in-between 3 and 16 characters'
      })
    }
    else{
      var that = this;
      $.ajax({
        url: '/summoners/'+that.state.region+'/'+that.state.username,
        method: 'GET',
        success: function(data){
          console.log(data.status)
          if(data.status){
            that.setState({
              show: false,
              errorState: 'alert alert-danger',
              error: 'Summoner not found on region '+ that.state.region_name +'. Error code: '+data.status.status_code
            })
          }
          else{
            console.log(data);
            that.updateRoles(data.matches);
          }
        },
        error: function(data){
          console.log("HI");
          that.setState({
            errorState: '',
            error: 'error!'
          })
        }
      })
    }
  },

  displayTable(){
    if(this.state.show){
      return(
        <div>
          <div className="row justify-content-center">
            <h3>{this.state.name}&#39;s data for past 20 games</h3>
            <table className="table text-left">
              <thead>
                <tr>
                  <th>Role</th>
                  <th># of times Played</th>
                  <th>Winrate</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Top</th>
                  <td>{this.state.roles[0]}</td>
                  <td></td>
                </tr>
                <tr>
                  <th scope="row">Jungle</th>
                  <td>{this.state.roles[1]}</td>
                  <td></td>
                </tr>
                <tr>
                  <th scope="row">Mid</th>
                  <td>{this.state.roles[2]}</td>
                  <td></td>
                </tr>
                <tr>
                  <th scope="row">ADC</th>
                  <td>{this.state.roles[3]}</td>
                  <td></td>
                </tr>
                <tr>
                  <th scope="row">Support</th>
                  <td>{this.state.roles[4]}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    }
  },

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

  dropdownButton(){
    return(
      <div className="btn-group">
        <button type="button" className="btn btn-danger dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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
    );
  },

  render: function(){
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <div>
          {this.noticePane()}
        </div>
        <div className="container">
          <div>
            {this.dropdownButton()}<input onChange={this.changeUsername}></input>
            <br/>
            <button className="btn btn-primary" onClick={this.expressCall}>Search</button>
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
