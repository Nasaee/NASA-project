FROM node:tls-alpine

WORKDIR /app

# (COPY) first is source of our app (local project), second . is destination of our app (WORKDIR /app) in docker image
COPY package*.json ./

# CLIENT
#  install dependencies and omit dev dependencies
COPY client/package*.json ./client/ 
RUN  npm run install-client --omit=dev 

# SERVER
COPY server/package*.json ./server/
RUN  npm run install-server --omit=dev 

 
# COPY our app code to docker image
COPY ./client/ ./client/
RUN npm run build --prefix client

COPY ./server/ ./server/

USER node

#  array of command we want to run 
CMD [ "npm", "start", "--prefix", "server" ]

# Expose port
EXPOSE 8000

# NOTE:
# create node image in alpine linux docker

# create work directory in docker

# copy package.json and package-lock.json in root directory to work directory in docker

# copy client package.json and package-lock.json in client directory to work directory in docker
# run npm to install dependencies

# copy server package.json and package-lock.json in server directory to work directory in docker
# run npm to install dependencies

# copy client project code to work directory/client in docker
# run npm to build to build client project

# copy server project code to work directory/server in docker

# USER node: for security purpose it makes sure that only node user can run our app

# run npm to start server to run server

# Expose on port 8000