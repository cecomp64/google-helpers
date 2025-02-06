const {GoogleAuth} = require('google-auth-library');
const { google } = require('googleapis');
const {scopes} = require('./shared-variables');

async function google_auth(base64_credentials) {
  const credentials = JSON.parse(
    Buffer.from(base64_credentials, 'base64').toString('utf-8')
  );

  const auth = new GoogleAuth({
    scopes: scopes,
    credentials: credentials,
  });
  var client = await auth.getClient();

  return client;
}

//  google_impersonate
//
//  Returns a Google Client, authenticated against the input
//  email and token/auth_code
async function google_impersonate({client_credentials, refresh_token, auth_code, email}) {
   const credentials = JSON.parse(
    Buffer.from(client_credentials, 'base64').toString('utf-8')
  );
  console.log('Authenticating...')
  const client = new google.auth.OAuth2(
    credentials.web.client_id,
    credentials.web.client_secret,
    'https://127.0.0.1:3001/google/callback',
  );

  if(refresh_token == null) {
    console.log('Getting Tokens...')
    const { tokens } = await client.getToken(auth_code);
    console.log(`tokens: ${JSON.stringify(tokens)}`);
    refresh_token = tokens.refresh_token;
  }

  console.log('Setting Credentials...')
  client.setCredentials({subject: email, refresh_token: refresh_token})

  return client;
}

async function read_spreadsheet(client, sheetId, range) {
  // Now let's make a request to the Google Sheets API 
  const sheets = google.sheets({version: 'v4', auth: client}); 
  const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: range, }); 
  //console.log('Data from sheet:', response.data.values);

  return response.data.values;
}

async function write_spreadsheet(client, sheetId, range, values) {
  const sheets = google.sheets({version: 'v4', auth: client});
  try {
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: range,
      valueInputOption: 'RAW',
      requestBody: {
        majorDimension: 'ROWS',
        values: values
      },
    });
    console.log(`${response.data.updatedCells} cells updated.`);
  } catch (err) {
    console.error('Error writing to sheet:', err);
  }
}

async function lookup_group_members(client, group) {
  const service = google.admin({ version: 'directory_v1', auth: client });
  console.log('Listing members...')
  const res = await service.members.list({groupKey: group});
  console.dir(res);

  return res;
}

//  member should be an array of e-mail addresses or ids
async function delete_group_members(client, group, members) {
  const service = google.admin({ version: 'directory_v1', auth: client });
  await members.foreach(async (member) => {
    console.log(`Deleting member: ${member}`)
    const res = await service.members.delete({groupKey: group, memberKey: member});
    console.dir(res);
  })

  return res;
}

//  member should be an array of {email: email, role: role}
//  i.e. {email: joe@sjaa.net, role: 'MEMBER'}
async function add_group_members(client, group, members) {
  const service = google.admin({ version: 'directory_v1', auth: client });
  await members.foreach(async (member) => {
    console.log(`Adding member: ${member}`)
    const res = await service.members.insert({groupKey: group, requestBody: member});
    console.dir(res);
  })

  return res;
}

// Returns a base64-encoded string representation of an Object.  Useful for environment variables
function base64_encode(obj) {
  return btoa(JSON.stringify(obj))
}

module.exports = { 
  google_auth, 
  read_spreadsheet, 
  write_spreadsheet,
  lookup_group_members,
  google_impersonate,
  base64_encode,
  add_group_members,
  delete_group_members
};