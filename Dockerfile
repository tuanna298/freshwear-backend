# Use the official Node.js image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the rest of the application files
COPY . .

# Install the application dependencies
RUN npm install --ignore-scripts

# Install dependencies with specific flags for development
RUN npx prisma generate

# Build the NestJS application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start:prod"]
