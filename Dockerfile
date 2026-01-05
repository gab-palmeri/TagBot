# Stage 1: Build (Lo chiamiamo "builder")
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Runtime (Qui usiamo node:20-alpine, NON builder)
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY src/locales ./src/locales

CMD ["node", "dist/index.js"]