FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

WORKDIR /usr/share/nginx/html


COPY --from=build /app/dist .


COPY env.sh .
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN chmod +x env.sh

EXPOSE 80

CMD ["/bin/sh", "-c", "./env.sh && nginx -g \"daemon off;\""]
