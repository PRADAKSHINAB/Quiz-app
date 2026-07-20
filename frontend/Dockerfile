FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the Vite React app
RUN npm run build

EXPOSE 3000

# Start a simple static file server to serve the React app
CMD ["npx", "serve", "-s", "dist", "-l", "3000"]
