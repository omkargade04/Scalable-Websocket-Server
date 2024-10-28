FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

COPY tsconfig.json ./

RUN npm install

COPY src/ ./src/

RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]