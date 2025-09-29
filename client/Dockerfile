# ====== STAGE 1: сборка ======
FROM node:20 AS build

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY client/package*.json ./
RUN npm install

# Копируем весь проект
COPY client/. .

# Собираем фронтенд
RUN npm run build

# ====== STAGE 2: Nginx для раздачи статики ======
FROM nginx:stable-alpine

# Копируем готовый билд
COPY --from=build /app/build /usr/share/nginx/html

# Копируем кастомный конфиг Nginx (если нужен роутинг SPA)
ARG NGINX_CONF
COPY ${NGINX_CONF} /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
