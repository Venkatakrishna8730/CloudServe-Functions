FROM node:20-alpine

WORKDIR /app

COPY gateway/package.json ./

RUN npm install

COPY shared ./shared
COPY gateway ./gateway

EXPOSE 5001

CMD ["npm", "start"]
