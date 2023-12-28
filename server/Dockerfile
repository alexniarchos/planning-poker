# Use an official Node.js runtime as a base image
FROM node:20-alpine

ENV NODE_ENV production

# Set the working directory in the container
WORKDIR /usr/src/app

COPY --chown=node:node . /usr/src/app

# Install app dependencies
RUN npm ci --only=production

USER node

# Expose the port that your app will run on
EXPOSE 3001

# Command to run your application
CMD "npm" "start"
