FROM node:16

RUN npm install -g nodemon

WORKDIR /app

COPY ./package*.json/ ./

RUN npm install

COPY . .

ENV PORT=8000
ENV MONGO_URL=
ENV JWT_SECRET=
EXPOSE 3000

CMD ["npm", "run", "dev"]