FROM node:20
WORKDIR /app

COPY client/package*.json ./
RUN npm install

COPY client/. .

ENV WATCHPACK_POLLING=true
ENV BROWSER=none
ENV PORT=80
EXPOSE 80

CMD ["npm", "start"]
