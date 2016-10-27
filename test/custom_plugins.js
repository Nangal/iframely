'use strict';

var request = require('supertest');
var ServerMock = require('mock-http-server');
var chai = require('chai');
var async = require('async');

describe.only('custom plugins', function() {

  var CUSTOM_PLUGINS_PATH = __dirname + '/fixtures/custom-plugins';

  var BASE_IFRAMELY_SERVER_URL = 'http://localhost:' + process.env.PORT;
  var server = require('../server'); // start card meta
  console.log(server);

  var TARGET_MOCKED_SERVER_PORT = 9000;
  var TARGET_MOCKED_SERVER_BASEURL = 'http://127.0.0.1:' + TARGET_MOCKED_SERVER_PORT;

  var targetMockedServer = new ServerMock({ host: 'localhost', port: TARGET_MOCKED_SERVER_PORT });


  beforeEach(function(done) {
    targetMockedServer.start(done);
  });

  afterEach(function(done) {
    targetMockedServer.stop(done);
  });

  it('should use a custom plugin if defined', function(done) {
    targetMockedServer.on({
      method: 'GET',
      path: '/testok',
      reply: {
        status:  200,
        headers: { 'content-type': 'text/html' },
        body: "<html><title>my title</title><meta name='description' content='my description'><body>Hi there!</body></html>"
      }
    });

    CONFIG.CUSTOM_PLUGINS_PATH = CUSTOM_PLUGINS_PATH;
    var url = TARGET_MOCKED_SERVER_BASEURL + '/testok';
    request(BASE_IFRAMELY_SERVER_URL)
        .get('/iframely?url=' + url)
        .end(function(err, res) {
          chai.expect(res.body.meta.description).to.equal('custom description');
          done(err);
        });
  });

  it.only('should use a core plugin if no custom plugin exists', function(done) {
    targetMockedServer.on({
      method: 'GET',
      path: '/testok',
      reply: {
        status:  200,
        headers: { 'content-type': 'text/html' },
        body: "<html><title>my title</title><meta name='description' content='my description'><body>Hi there!</body></html>"
      }
    });


    CONFIG.CUSTOM_PLUGINS_PATH = '';
    var url = TARGET_MOCKED_SERVER_BASEURL + '/testok';
    request(BASE_IFRAMELY_SERVER_URL)
        .get('/iframely?url=' + url)
        .end(function(err, res) {
          console.log(res.body.meta);
          chai.expect(res.body.meta.title).to.equal('my title');
          done(err);
        });
  });

  it('should use a custom plugin overriding a core plugin ', function(done) {
    targetMockedServer.on({
      method: 'GET',
      path: '/testok',
      reply: {
        status:  200,
        headers: { 'content-type': 'text/html' },
        body: "<html><title>my title</title><meta name='description' content='my description'><body>Hi there!</body></html>"
      }
    });

    CONFIG.CUSTOM_PLUGINS_PATH = CUSTOM_PLUGINS_PATH;
    var url = TARGET_MOCKED_SERVER_BASEURL + '/testok';
    request(BASE_IFRAMELY_SERVER_URL)
        .get('/iframely?url=' + url)
        .end(function(err, res) {
          console.log(res.body.meta);
          chai.expect(res.body.meta.title).to.equal('TITLE FROM CUSTOM-PLUGIN');
          done(err);
        });
  });

});
