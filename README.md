# Usage

Create a .env file with:

```sh
GOOGLE_APPLICATION_CREDENTIALS_BASE64=...
GOOGLE_MEMBERSHIP_GROUP=...
```

Using Base64-encoded credentials.json for a Google Cloud Compute service account, and the name
of a google group (i.e. mygroup@googlegroups.com) to try to access.  Run to test:

```sh
npm install
npm run test
```

# Impersonating a User with Domain Wide Delegation

Yes, you can access the list of group members as a particular user by impersonating them. This is often used in G Suite domain-wide delegation of authority. 

You'll need to set up domain-wide delegation for your service account and include the `subject` parameter in your OAuth2 client configuration. Here's a step-by-step guide:

1. **Set up domain-wide delegation**: Go to the **Google Cloud Console**, and select your project. In the **IAM & Admin** section, go to **Service accounts**. Select your service account, then click **Edit**. Enable **G Suite Domain-wide Delegation** and save the changes.

2. **Authorize the API scopes**: Go to the **Admin console**, and authorize the API scopes for your service account. Navigate to **Security** -> **API controls** -> **Manage Domain Wide Delegation**. Add your service account's client ID and the required API scopes (`https://www.googleapis.com/auth/admin.directory.group.member.readonly`).

3. **Modify your code**: Update your code to include the `subject` parameter when creating the OAuth2 client.

Here's an updated example:

```javascript
const { google } = require('googleapis');

// Set up the OAuth2 client
const client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'YOUR_REDIRECT_URL'
);

// Set the access token and impersonate the user
client.setCredentials({
  refresh_token: 'YOUR_REFRESH_TOKEN',
  subject: 'user@example.com'  // Replace with the email address of the user to impersonate
});

// Create a service object for the Directory API
const service = google.admin('directory_v1');

// List group members
async function listGroupMembers(groupKey) {
  try {
    const res = await service.members.list({
      auth: client,
      groupKey: groupKey,
      roles: 'OWNER,MANAGER,MEMBER',
      maxResults: 100,
      includeDerivedMembership: true
    });
    console.log('Members:', res.data.members);
  } catch (err) {
    console.error('Error:', err);
  }
}

listGroupMembers('YOUR_GROUP_KEY');
```

Make sure to replace `'user@example.com'` with the email address of the user you want to impersonate.

# Obtaining a refresh token

To generate a refresh token for your Google API, you'll need to go through the OAuth 2.0 authentication flow. Here are the steps:

1. **Set Up Your Project**: Ensure that your project is set up in the Google Cloud Console and the appropriate APIs are enabled.

2. **Create OAuth 2.0 Credentials**: 
   - Go to **APIs & Services** -> **Credentials** in the Google Cloud Console.
   - Click **Create Credentials** and select **OAuth 2.0 Client IDs**.
   - Configure the consent screen and save your settings.
   - After configuring the consent screen, create an OAuth 2.0 client ID with your desired settings (e.g., web application).

3. **Get Authorization Code**:
   - Direct the user to Google's OAuth 2.0 server to authorize your application and obtain an authorization code.
   - Construct the authorization URL with the required parameters, including `client_id`, `redirect_uri`, `scope`, and `response_type=code`.

   Here’s an example of the authorization URL:
   ```javascript
   const authUrl = 'https://accounts.google.com/o/oauth2/auth' +
                   '?client_id=YOUR_CLIENT_ID' +
                   '&redirect_uri=YOUR_REDIRECT_URI' +
                   '&scope=https://www.googleapis.com/auth/drive' + // Example scope
                   '&response_type=code' +
                   '&access_type=offline';  // Ensure you get a refresh token
   ```
   Navigate the user to this URL to obtain the authorization code.

4. **Exchange Authorization Code for Tokens**:
   - Use the authorization code to obtain an access token and a refresh token.
   - Send a POST request to Google's token endpoint with your `client_id`, `client_secret`, `code`, `redirect_uri`, and `grant_type=authorization_code`.

   Here’s an example using the `google-auth-library`:

   ```javascript
   const { google } = require('google-auth-library');

   const client = new google.auth.OAuth2(
     'YOUR_CLIENT_ID',
     'YOUR_CLIENT_SECRET',
     'YOUR_REDIRECT_URI'
   );

   async function getTokens(code) {
     const { tokens } = await client.getToken(code);  // Exchange code for tokens
     console.log('Access Token:', tokens.access_token);
     console.log('Refresh Token:', tokens.refresh_token);
   }

   // Replace 'YOUR_AUTHORIZATION_CODE' with the actual authorization code received
   getTokens('YOUR_AUTHORIZATION_CODE');
   ```

5. **Store and Use the Refresh Token**: 
   - Save the refresh token securely. You’ll use it to refresh your access tokens without prompting the user to re-authenticate.

# Obtaining Authorization Code

It's the response from the auth URL above

# Domain-Wide Delegation

Need a Google Workspace admin to enable for project linked to service account