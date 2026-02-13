FROM node:18-alpine

WORKDIR /app

# Copy package.json
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy all backend source code
COPY backend/ ./

# Create public directory and copy frontend files
RUN mkdir -p public
COPY *.html public/
COPY *.css public/
COPY *.js public/

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "server.js"]
