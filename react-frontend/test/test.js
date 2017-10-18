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

  //could not simulate the clicking, leaving this one out
  /*
  it('should grab matches for name "supernovamaniac"', function(){
    const wrapper = mount(<App/>);
    wrapper.setState({username: "supernovamaniac"});
    wrapper.state().username.should.equal("supernovamaniac");
    wrapper.find('button').at(1).simulate('click');
    setImmediate(()=>{
      wrapper.state().show.should.equal(true);
      wrapper.state().name.should.equal("supernovamaniac");
      wrapper.state().top.should.equal(1);
    })
  })
  */

})

//./node_modules/mocha/bin/mocha --compilers js:babel-core/register --require ignore-styles
