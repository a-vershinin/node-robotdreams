# Base image
FROM node:20.10.0

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install app dependencies
RUN npm ci

# Copy the rest of the application source code to the container
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Expose the port your Nest.js application is listening on
EXPOSE 3000


# Command to start your Nest.js application
CMD ["npm", "run", "start:dev"]
