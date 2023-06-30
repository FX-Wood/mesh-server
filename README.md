# mesh-server
This proxy server was necessary because I was struggling to use the prisma 
client with next 13's app directory and automagic server/client side rendering.
I blame the sleep deprivation!

It is a simple expressjs server that incorporates prisma and the prisma client. 

## Getting started
1. `git clone https://github.com/fx-wood/mesh-server`
2. `cd mesh-server && yarn install`

### Set up postgres
Set up a postgres instance somewhere, locally or in the cloud. Note that if you change
the schema you'll need to have db create permissions in the postgres instance, which
some free/cheap tier instances don't provide (looking at you elephantsql)

Once you've set up the postgres instance, make a postgres connection URL 
and put it in .env file:
```
  echo 'DB_URL="postgres://{user}:{password}@{hostname}:{port}/{database-name}"' >> .env
```

### Initialize DB
1. `npx prisma migrate deploy` or something similar
2. `cd prisma` this is important, the scripts will fail if you run them elsewhere
3. `node seed.js`
4. `node updateMeshes.js`

### Run server!
0. `cd ..` (go back to root of project if you haven't already)
1. `yarn run start`
2. `curl localhost:3000`
