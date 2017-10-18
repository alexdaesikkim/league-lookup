const request = require('supertest');
const should = require('should');
const app = require('../app.js');
const summoners = require('../routes/summoners.js');

const summoner_json = require('../routes/summoner_json');
const matches_json = require('../routes/matches_json');
const champions_json = require('../routes/champions.json');

describe('testing HTTP calls', function() {
  it('respond correctly for supernovamaniac', function(done){
    request(app)
      .get('/summoners/na1/supernovamaniac')
      .expect(200)
      .end(function(err, res){
        res.status.should.equal(200);
        res.body.name.should.equal("supernovamaniac");
        res.body.top.should.equal(1);
        res.body.jungle.should.equal(0);
        res.body.mid.should.equal(2);
        res.body.adc.should.equal(18);
        res.body.support.should.equal(4);
        done();
      })
  })

  it('respond correctly for menohaxor', function(done){
    request(app)
      .get('/summoners/na1/menohaxor')
      .expect(200)
      .end(function(err, res){
        res.status.should.equal(200);
        res.body.name.should.equal("MeNoHaxor");
        res.body.name.should.not.equal("menohaxor");
        res.body.top.should.equal(0);
        res.body.jungle.should.equal(6);
        res.body.mid.should.equal(3);
        res.body.adc.should.equal(5);
        res.body.support.should.equal(83);
        done();
      })
  })

  it('responds with 404 for invalid link', function(done){
    request(app)
      .get('/summoners/randomlink')
      .expect(404, done)
  })

  it('responds with 500 for internal error', function(done){
    request(app)
      .get('/summoners/na1/testservererror')
      .expect(500, done)
  })

  it('responds with 404 for not existing user', function(done){
    request(app)
      .get('/summoners/na1/testnotfound')
      .expect(404, done)
  })

  it('responds with 404 for invalid user', function(done){
    request(app)
      .get('/summoners/na1/baduser1')
      .expect(404, done)
  })

  it('responds with 422 for user with no games in current season', function(done){
    request(app)
      .get('/summoners/na1/baduser2')
      .expect(422, done)
  })

})
