FROM node:14-alpine as base

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm install -g @nestjs/cli
CMD ["npm", "run", "start:dev"]