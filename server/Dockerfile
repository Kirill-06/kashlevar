# PHP-FPM
FROM php:8.2-fpm

# PHP расширения
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Nginx
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Копируем серверный код
COPY api /var/www/html

# Копируем фронтенд файлы (если есть)
COPY index.html /var/www/html/

# Копируем конфиг Nginx
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80

# Запуск PHP-FPM + Nginx
CMD ["sh", "-c", "php-fpm -D && nginx -g 'daemon off;'"]
