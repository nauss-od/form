FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    libzip-dev \
    zip \
    nodejs \
    npm \
    && docker-php-ext-install zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . /app

RUN composer install --no-dev --optimize-autoloader || true
RUN npm install || true
RUN npm run build || true

RUN cp .env.example .env || true
RUN php artisan key:generate || true

EXPOSE 10000

CMD sh -c "php artisan serve --host 0.0.0.0 --port ${PORT:-10000}"