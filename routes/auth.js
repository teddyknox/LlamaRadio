var express = require('express');
var router = express.Router();
var OAuth2 = require('oauth').OAuth2;

var clientId = process.env.CLIENT_ID;
var clientSecret = process.env.CLIENT_SECRET;
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

router.post('/', function(req, res, next) {
  console.log(req.body);
  if (!req.body.personalEmail || ! req.body.workEmail) {
    // TODO: Redirect to validation error page
    return res.redirect('.');
  } else {
    var authUrl = oauth2.getAuthorizeUrl({
        redirect_uri: redirectUri,
        scope: ['shared_playstate'],
        response_type: 'code',
        email: req.body.personalEmail,
        showSignup: true
    });
    // TODO: Fire off an email confirmation task.
    res.redirect(authUrl)
  }
});

router.get('/code', function(req, res, next) {
  if (req.query.error) {
    next(new Error("Rdio returned status " + req.query.error + " and message " + req.query.errorMessage));
  }
  oauth2.getOAuthAccessToken(
    req.query.code,
    { 'grant_type': 'authorization_code',
      'redirect_uri': redirectUri },
    function (err, access_token, refresh_token, results) {
        if (err) {
          next(err);
        } else if (results.error) {
          console.error(results.error);
          console.log("Results error");
          res.end(JSON.stringify(results));
        } else {
          // TODO: Save access token and refresh_token to user model.
        }
  });
});

module.exports = router;
