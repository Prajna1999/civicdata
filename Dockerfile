# Use the official Node.js 18 image as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application's source code
COPY . .

# Build your NestJS application
RUN npm run build

# Expose the port your app runs on
EXPOSE 8080

# Define the command to run your app
CMD ["npm", "run", "start:prod"]