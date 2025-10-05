FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql pgsql \
    && apt-get clean && rm -rf /var/lib/apt/lists/*


RUN docker-php-ext-install pdo pdo_pgsql pgsql

WORKDIR /var/www/html

COPY ./php/local.ini /usr/local/etc/php/conf.d/local.ini

COPY ./api /var/www/html
