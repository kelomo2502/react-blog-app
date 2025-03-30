# ⚡ Stage 1: Build Stage (Uses Node.js)
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Ensure the working directory is owned by the node user
RUN chown -R node:node /app

# Switch to the non-root "node" user for the build process
USER node

# Copy package files and install dependencies
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --unsafe-perm

# Copy the rest of the application source files
COPY --chown=node:node . .

# Build the production version (generates the 'dist' folder)
RUN npm run build

# ⚡ Stage 2: Production Stage (Uses Nginx)
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Remove default nginx static files & copy build files
RUN rm -rf ./*
COPY --from=builder /app/dist ./

# Copy custom entrypoint script (if used for runtime configuration injection)
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Use the custom entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]
