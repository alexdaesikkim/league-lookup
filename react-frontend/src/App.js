//eslint-disable-next-line
import React, { Component } from 'react';
import './App.css';
import $ from 'jquery';

var createReactClass = require('create-react-class');

var App = createReactClass({
  getInitialState(){
    return{
      top: 0,
      jungle: 0,
      mid: 0,
      adc: 0,
      support: 0,
      champions: 0,
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
      var that = this;
      $.ajax({
        url: '/summoners/'+that.state.region+'/'+that.state.username,
        method: 'GET',
        success: function(data){
          console.log(data.status);
          if(data.status){
            that.setState({
              show: false,
              errorState: 'alert alert-danger',
              error: 'Summoner not found on region '+ that.state.region_name +'. Error code: '+data.status.status_code
            })
          }
          else{
            that.setState({
              top: data.top,
              jungle: data.jungle,
              mid: data.mid,
              adc: data.adc,
              support: data.support,
              champions: data.champions,
              match_number: data.total,
              show: true,
              name: that.state.username,
              errorState: '',
              error: ''
            });
          }
        },
        error: function(data){
          that.setState({
            errorState: 'alert alert-danger',
            error: 'Backend Error'
          })
        }
      })
    }
  },
  //not sure if this renders well
  /*
  displayAccordion(){
    if(this.state.show){
      return(
        <div id="accordion" role="tablist">
          <Lanes lane="Top" champions = {this.state.champions} number = {this.state.top} total_number = {this.state.match_number} id="Top" />
          <Lanes lane="Jungle" champions = {this.state.champions} number = {this.state.jungle} total_number = {this.state.match_number} id="Jungle" />
          <Lanes lane="Mid" champions = {this.state.champions} number = {this.state.mid} total_number = {this.state.match_number} id="Mid" />
          <Lanes lane="ADC" champions = {this.state.champions} number = {this.state.adc} total_number = {this.state.match_number} id="ADC" />
          <Lanes lane="Support" champions = {this.state.champions} number = {this.state.support} total_number = {this.state.match_number} id="Support" />
        </div>
      );
    }
  },
  */

  sortChampions(champions){
    //very small size but regardless using better practice
    var list = [];
    var total = 0;
    for(var champion in champions){
      console.log(champion);
      console.log(champions[champion]);
      list.push([champion, champions[champion]]);
      total = total + champions[champion];
    }
    list.sort(function(x, y){
      return y[1] - x[1];
    });
    list = list.map(function(champion){
      return champion[0] + " (" + (Math.round(champion[1] * 1000.0 / total)/10)+ "%), ";
    })
    var str = "";
    for(var i = 0; i < (list.length < 3 ? list.length : 3); i++){
      console.log(list[i]);
      str = str + list[i];
    }
    console.log(str);
    return str.slice(0, -2);
  },

  displayTable(){
    if(this.state.show){
      return(
        <div>
          <div className="row justify-content-center">
            <br/>
            <h3>{this.state.name}&#39;s data for this season&#39;s {this.state.match_number} games on region {this.state.region_name}</h3>
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
            Currently only supports current season.
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
      <div>
        <div className="App">
          <header className="App-header">
            <h1 className="App-title">Summoner Lookup</h1>
            <br/>
            <div>
              {this.dropdownButton()} <input onChange={this.changeUsername}></input>
              <br/>
              <button className="btn btn-primary" onClick={this.expressCall}>Search</button>
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
/*
var Lanes = createReactClass({
  getInitialState(){
    return{
      champions: [],
      total_number: 0
    }
  },

  sortChampions(){
    //very small size but regardless using better practice
    var list = [];
    var champObj = this.props.chamipons;
    var total = 0;
    for(var champion in champObj){
      list.push([champion, champObj[champion]]);
      total = total + champObj[champion];
    }
    list.sort(function(x, y){
      return x[1] = y[1];
    });
    this.setState({
      chamipons: list,
      total_number: total
    })

  },

  render: function(){

    var champs = this.state.champions.map(function(champ){
      return(
        <div>
          {champ[0]} + " " + {champ[1]};
        </div>
      )
    })

    return(
      <div className="card">
        <div className="card-header" role="tab" id={"heading_"+this.props.lane}>
          <h5 className="mb-0">
            <a data-toggle="collapse" href={"#"+this.props.lane} aria-expanded="true" aria-controls={this.props.lane}>
              {this.props.lane}
            </a>
            <span className="text-right">
              {Math.round((this.props.number * 1000.0) / this.props.total_number)/10 + "%"}
            </span>
          </h5>
        </div>

        <div id={this.props.lane} className="collapse" role="tabpanel" aria-labelledby={"heading_"+this.props.lane} data-parent="#accordion">
          <div className="container">
            {this.props.number}
            <br/>
            Most played Champions:
            {champs}
            <br/>
          </div>
        </div>
      </div>
    );

  }
})
*/


export default App;
