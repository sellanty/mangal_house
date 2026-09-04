FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]