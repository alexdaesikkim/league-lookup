import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {expect} from 'chai';
import {mount, shallow} from 'enzyme';
import 'jsdom-global/register';

import App from '../src/App.js';

Enzyme.configure({adapter: new Adapter()});

const should = require('should');

describe('testing react dom', function(){
  it('should load initial states correctly', function(){
    const wrapper = shallow(<App/>);
    wrapper.state().top.should.equal(0);
    wrapper.state().jungle.should.equal(0);
    wrapper.state().mid.should.equal(0);
    wrapper.state().adc.should.equal(0);
    wrapper.state().support.should.equal(0);
    wrapper.state().champions.should.equal('');
    wrapper.state().match_number.should.equal(0);
    wrapper.state().username.should.equal("");
    wrapper.state().name.should.equal("");
    wrapper.state().region.should.equal("na1");
    wrapper.state().region_name.should.equal("NA");
    wrapper.state().show.should.equal(false);
    wrapper.state().error.should.equal("");
    wrapper.state().errorState.should.equal("");

  })

  //to learn: how to test individual functions rather that clicking on each to simulate? is it different testing?
  it('should grab matches for name "supernovamaniac"', function(){
    const wrapper = mount(<App/>);
    wrapper.setState({username: "supernovamaniac"});
    wrapper.state().username.should.equal("supernovamaniac");
    wrapper.state().region.should.equal("na1");
    wrapper.find('button').at(1).simulate('click');

    wrapper.state().name.should.equal("supernovamaniac");
    wrapper.state().show.should.equal(true);
    wrapper.state().top.should.equal(1);
    wrapper.state().jungle.should.equal(0);
    wrapper.state().mid.should.equal(2);
    wrapper.state().adc.should.equal(18);
    wrapper.state().support.should.equal(4);

    wrapper.find('tbody').find('tr').at(0).find('td').at(1).text().should.equal("4%");
    wrapper.find('tbody').find('tr').at(1).find('td').at(1).text().should.equal("0%");
    wrapper.find('tbody').find('tr').at(2).find('td').at(1).text().should.equal("8%");
    wrapper.find('tbody').find('tr').at(3).find('td').at(1).text().should.equal("72%");
    wrapper.find('tbody').find('tr').at(4).find('td').at(1).text().should.equal("16%");
    wrapper.find('tbody').find('tr').at(1).find('td').at(2).text().should.equal("None");
    wrapper.find('tbody').find('tr').at(3).find('td').at(2).text().should.equal("Caitlyn (77.8%), Miss Fortune (11.1%), Lucian (5.6%)");
    wrapper.state().error.should.equal("");
  });

  it('should grab matches for name "menohaxor"', function(){
    const wrapper = mount(<App/>);
    wrapper.setState({username: "menohaxor"});
    wrapper.state().username.should.equal("menohaxor");
    wrapper.state().region.should.equal("na1");
    wrapper.find('button').at(1).simulate('click');

    wrapper.state().name.should.equal("MeNoHaxor");
    wrapper.state().show.should.equal(true);
    wrapper.state().top.should.equal(0);
    wrapper.state().jungle.should.equal(6);
    wrapper.state().mid.should.equal(3);
    wrapper.state().adc.should.equal(5);
    wrapper.state().support.should.equal(83);

    wrapper.find('tbody').find('tr').at(0).find('td').at(1).text().should.equal("0%");
    wrapper.find('tbody').find('tr').at(1).find('td').at(1).text().should.equal("6.2%");
    wrapper.find('tbody').find('tr').at(2).find('td').at(1).text().should.equal("3.1%");
    wrapper.find('tbody').find('tr').at(3).find('td').at(1).text().should.equal("5.2%");
    wrapper.find('tbody').find('tr').at(4).find('td').at(1).text().should.equal("85.6%");
    wrapper.find('tbody').find('tr').at(0).find('td').at(2).text().should.equal("None");
    wrapper.find('tbody').find('tr').at(4).find('td').at(2).text().should.equal("Rakan (30.1%), Lulu (20.5%), Sona (10.8%)");
    wrapper.state().error.should.equal("");
  });

  //below also tests if you can grab users after internal error, then show the warning panel after this.state.show = true
  //which is noted in one of the comments
  it('should throw error for short/long name', function(){
    const wrapper = mount(<App/>);
    wrapper.setState({username:"ad"});
    wrapper.find('button').at(1).simulate('click');
    wrapper.state().error.should.equal("Character has to be in-between 3 and 16 characters");
    wrapper.state().errorState.should.equal("alert alert-warning");
    wrapper.state().show.should.equal(false);

    wrapper.setState({username:"supernovamaniac"});
    wrapper.find('button').at(1).simulate('click');
    wrapper.state().error.should.equal("");
    wrapper.state().show.should.equal(true);

    wrapper.setState({username:"thisuernameistoolongforriotgames"});
    wrapper.find('button').at(1).simulate('click');
    wrapper.state().error.should.equal("Character has to be in-between 3 and 16 characters");
    wrapper.state().errorState.should.equal("alert alert-warning");
    //note: INTENDED BEHAVIOR
    wrapper.state().show.should.equal(true);
  });

  it('should throw error for test usernames that returns error', function(){
    const wrapper = mount(<App/>);
    wrapper.setState({username:"testservererror"});

    wrapper.find('button').at(1).simulate('click');
    wrapper.state().error.should.equal('Internal server error (API call returned with status 500)');
    wrapper.state().errorState.should.equal("alert alert-danger");

    wrapper.setState({username:"testnotfound"});
    wrapper.find('button').at(1).simulate('click');
    wrapper.state().error.should.equal('Could not find user "testnotfound" on region NA');
    wrapper.state().errorState.should.equal("alert alert-danger");

    wrapper.setState({username:"baduser1"});
    wrapper.find('button').at(1).simulate('click');
    wrapper.state().error.should.equal('Could not find user "baduser1" on region NA');
    wrapper.state().errorState.should.equal("alert alert-danger");

    wrapper.setState({username:"baduser2"});
    wrapper.find('button').at(1).simulate('click');
    wrapper.state().error.should.equal('No match data was found for user "baduser2"');
    wrapper.state().errorState.should.equal("alert alert-danger");
  })


})

//to run tests: ./node_modules/mocha/bin/mocha --compilers js:babel-core/register --require ignore-styles
//todo: script it
