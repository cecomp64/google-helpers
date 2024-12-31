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