FROM php:8.2-fpm

RUN docker-php-ext-install pdo pdo_mysql mysqli

WORKDIR /var/www/html

COPY ./local.ini /usr/local/etc/php/conf.d/local.ini