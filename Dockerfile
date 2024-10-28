FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

COPY tsconfig.json ./

RUN npm install --only=development

RUN npm install typescript --save-dev

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]