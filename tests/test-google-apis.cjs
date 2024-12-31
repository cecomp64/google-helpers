const GAPI = require('../src/google-apis');

async function test() {
  var client = await GAPI.google_auth();
  console.dir(client);
  var result = await GAPI.lookup_group_members(client)
}

test();