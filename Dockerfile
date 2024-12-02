FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy project files
COPY . .

RUN mkdir -p logs
# Build both client and server
RUN npm run build:all

# Production stage
FROM node:18-alpine

WORKDIR /app



# Copy built assets and necessary files
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/src ./src
#COPY --from=build /app/.env.production ./dist/server/.env

# Install production dependencies only
RUN npm ci --omit=dev

RUN npm install -g tsx
# Create logs directory and set permissions
RUN mkdir -p logs && chown -R node:node logs

# Switch to non-root user
USER node

# Create volume for logs
VOLUME ["/app/logs"]

# Expose the port
EXPOSE 3000

# Start the server
CMD ["node", "dist/server/server.js"]
