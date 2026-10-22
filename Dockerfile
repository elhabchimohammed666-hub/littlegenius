# Multi-stage Dockerfile for LittleGenius MERN Application

# Stage 1: Build Frontend
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine AS runner
WORKDIR /app
COPY server/package*.json ./server/
RUN npm install --prefix server --production

COPY server/ ./server/
COPY --from=client-build /app/client/dist ./client/dist

ENV NODE_ENV=production
ENV PORT=5001

EXPOSE 5001

CMD ["node", "server/server.js"]
