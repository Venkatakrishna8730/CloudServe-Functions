FROM node:20-alpine

WORKDIR /app

COPY api/package.json ./

RUN npm install

COPY shared ./shared
COPY api ./api

EXPOSE 5000

CMD ["npm", "start"]
