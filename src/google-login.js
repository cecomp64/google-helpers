require('dotenv').config();
const {scopes} = require('./shared-variables');
const express = require('express');
const app = express();

const callback = '/oauth2callback';
app.get(callback, (req, res) => {
  const code = req.query.code;
  // Exchange this authorization code for access and refresh tokens
  res.send('Authorization code: ' + code);
});

app.listen(4000, () => {
  const serverUrl = 'http://localhost:4000';
  console.log(`Server is running on ${serverUrl}`);

  const authUrl = 'https://accounts.google.com/o/oauth2/auth' +
                `?client_id=${process.env.GOOGLE_OAUTH_CLIENT_ID}` +
                `&redirect_uri=${serverUrl}${callback}` +
                `&scope=${scopes.join(' ')}` + // Example scope
                '&response_type=code' +
                '&access_type=offline';  // Ensure you get a refresh token

  console.log(`Navigate to the following URL to authorize SJAA access: ${authUrl}`);
});
