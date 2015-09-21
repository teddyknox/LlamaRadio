var express = require('express');
var router = express.Router();
var OAuth2 = require('oauth').OAuth2;

var clientId = process.env.CLIENT_ID;
var clientSecret = process.env.CLIENT_SECRET;
var csrfState = process.env.CSRF_STATE;
var domain = process.env.DOMAIN;
var port = process.env.PORT;

var oauth2 = new OAuth2(
    clientId,
    clientSecret,
    'https://www.rdio.com',
    '/oauth2/authorize',
    '/oauth2/token',
    null);

var redirectUri = 'http://' + domain + ((port == 80) ? '' : (':' + port)) + '/auth/code';
var authUrl = oauth2.getAuthorizeUrl({
    redirect_uri: redirectUri,
    scope: ['shared_playstate'],
    state: csrfState,
    response_type: 'code',
    // email: "eknox@linkedin.com",
    // showSignup: true
});

router.get('/', function(req, res, next) {
  res.redirect(authUrl)
});

router.get('/code', function(req, res, next) {
  if (!req.query.code || !req.query.state || req.query.state !== csrfState) {
    console.log("auth code error");
    console.log(req.query);
    // throw;
  }
  var code = req.query.code
  oauth2.getOAuthAccessToken(
    req.query.code,
    { 'grant_type': 'authorization_code',
      'redirect_uri': redirectUri },
    function (e, access_token, refresh_token, results){
        if (e) {
            console.log(e);
            res.end(e);
        } else if (results.error) {
            // TODO: Conditionally refresh the user's access token.
            console.log(results);
            res.end(JSON.stringify(results));
        }
        else {
            console.log('Obtained access_token: ', access_token);
            res.end(access_token);
        }
  });
});

module.exports = router;
