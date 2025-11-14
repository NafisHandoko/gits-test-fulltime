FROM php:8.3-fpm

# Install dependencies & PostgreSQL extension
RUN apt-get update && apt-get install -y \
    git curl libpq-dev unzip && \
    docker-php-ext-install pdo pdo_pgsql

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy project files
COPY . .

# Install Laravel dependencies
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# Generate application key & JWT secret
RUN php artisan key:generate

# Expose port
EXPOSE 8000

# Default command (run migrations + start server)
CMD ["sh", "-c", "php artisan migrate:fresh --seed && php artisan serve --host=0.0.0.0 --port=8000"]
