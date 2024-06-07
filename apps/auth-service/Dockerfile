FROM node:14.18.1-alpine3.14 AS preparestage

ARG APP_SERVICE
ENV APP_SERVICE=${APP_SERVICE}

WORKDIR /app

COPY package*.json .
COPY yarn.lock .

RUN yarn install

COPY . .

RUN yarn build auth-service

FROM node:14.18.1-alpine3.14

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ARG APP_SERVICE
ENV APP_SERVICE=${APP_SERVICE}

WORKDIR /app

COPY yarn.lock .

COPY --from=preparestage /app/dist/apps/${APP_SERVICE} .

RUN yarn install
RUN yarn add tslib

ENV NODE_ENV=development
ENV PORT=3000
ENV JWT_SECRET_KEY=EX_SECRET_KEY

CMD ["node", "main.js"]
