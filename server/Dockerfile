# Official Node.js 21 image
FROM node:21-alpine3.18

# Get the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application files to the working directory
COPY . .

# Expose the port on which your application listens
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
