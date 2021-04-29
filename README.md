## Setup
1. Make sure you run the `npm install` command to install all the libraries used in this repository.
2. Create a `.env` file and declare your Database URL under the variable `DB_URL`.  
```
DB_URL=<your database url>
```
3. In the root directory, run `node keys.js` to generate a pair of *public* & *private* keys, which will be used to sign/verify the JWT token. `.gitignore` file will ignore these keys, and will not publish to remote repository.

## Quickstart
You need to have the `mongo` command running either in a terminal in the background, or in the your IDE terminal.  
Once you have the database server running, just run `npm start` command to start the development server.  

## Note
For development purposes, the expiry time of the access token is set to 30 seconds whereas that of the refresh token
is set to 60 seconds. You may increase the expiry time in `generateTokens` function inside `utils/tokens.js` file.