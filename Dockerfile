# Use the official Node.js runtime as the base image
# Using specific version for Ubuntu 18.04 compatibility
FROM node:18.20.4-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Update package index and install dependencies
RUN apk update && apk add --no-cache curl

# Install Node.js dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app

USER nextjs

# Expose the port the app runs on
EXPOSE ${PORT:-3000}

# Start the application
CMD ["npm", "start"]