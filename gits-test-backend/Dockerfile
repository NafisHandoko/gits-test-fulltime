FROM php:8.3-fpm

# Install dependencies & PostgreSQL extension
RUN apt-get update && apt-get install -y \
    git curl libpq-dev unzip \
    && docker-php-ext-install pdo pdo_pgsql

# Install PCOV for code coverage
RUN apt-get update && apt-get install -y \
    $PHPIZE_DEPS \
    && pecl install pcov \
    && docker-php-ext-enable pcov \
    && apt-get remove -y $PHPIZE_DEPS \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy project files
COPY . .

# Install Laravel dependencies
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# Generate application key (JWT secret will be generated at runtime if not set)
RUN php artisan key:generate || true

# Expose port
EXPOSE 8000

# Default command (generate JWT secret if needed, then start server)
CMD ["sh", "-c", "php artisan jwt:secret --force 2>/dev/null || true && php artisan serve --host=0.0.0.0 --port=8000"]
