FROM node:16

RUN npm install -g nodemon

WORKDIR /app

COPY ./package*.json/ ./

RUN npm install

COPY . .

ENV PORT=8000
ENV MONGO_URL=mongodb+srv://amritmaurya2014:M7m8ym26pAeDrV1f@vegfru-db.niohpib.mongodb.net/vegFru-DB?retryWrites=true&w=majority
ENV JWT_SECRET=hellothisisamritrajmaurya2002frombiharindia

EXPOSE 3000

CMD ["npm", "run", "dev"]