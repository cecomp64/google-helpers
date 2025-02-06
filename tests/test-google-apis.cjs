const GAPI = require('../src/google-apis');
require('dotenv').config();

async function test() {
  var client = await GAPI.google_impersonate({
    client_credentials: process.env.GOOGLE_OAUTH_WEB_CLIENT_CREDENTIALS,
    refresh_token: process.env.GOOGLE_VP_REFRESH_TOKEN,
    email: process.env.GOOGLE_VP_EMAIL
  });

  console.dir(client);
  var result = await GAPI.lookup_group_members(client, process.env.GOOGLE_MEMBERSHIP_GROUP)

  console.dir(result.data)
}

test();