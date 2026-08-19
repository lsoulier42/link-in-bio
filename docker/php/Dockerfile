FROM php:8.5-apache

# Installation des dépendances système et PHP
# Note : extensions installées séparément car un build groupé d'intl
# échoue sur PHP 8.5 (install-modules) ; opcache est déjà inclus.
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libicu-dev \
    libzip-dev \
    libonig-dev \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libwebp-dev \
    && docker-php-ext-install intl \
    && docker-php-ext-install pdo \
    && docker-php-ext-install pdo_mysql \
    && docker-php-ext-install zip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install gd \
    && a2enmod rewrite

# Configuration d'Apache
COPY vhost.conf /etc/apache2/sites-available/000-default.conf

# Installation de Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Définition du répertoire de travail
WORKDIR /var/www/html

# Permissions
RUN chown -R www-data:www-data /var/www/html
