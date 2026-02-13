FROM node:18-alpine

WORKDIR /app

# Copy package.json files
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy backend source code
COPY backend/ ./

# Create public directory for frontend files
RUN mkdir -p public

# Copy frontend files to public directory
COPY *.html public/
COPY *.css public/
COPY *.js public/

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "server.js"]
