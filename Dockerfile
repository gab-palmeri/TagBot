# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app
COPY --from:builder /app/dist ./dist
COPY --from:builder /app/package*.json ./

CMD ["node", "dist/index.js"]