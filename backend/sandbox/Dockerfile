FROM node:20-alpine

WORKDIR /app

COPY sandbox/package.json ./

RUN npm install

COPY shared ./shared
COPY sandbox ./sandbox

EXPOSE 5002

CMD ["npm", "start"]
