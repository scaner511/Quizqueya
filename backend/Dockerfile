FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --silent

COPY src ./src
COPY .sequelizerc ./

ENV NODE_ENV=production
EXPOSE 5000

CMD ["sh", "-c", "node src/utils/seed.js && node src/server.js"]
