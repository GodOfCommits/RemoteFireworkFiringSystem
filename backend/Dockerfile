FROM php:8.2-apache

RUN a2enmod headers

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    sudo \
    && rm -rf /var/lib/apt/lists/*

RUN echo "www-data ALL=(root) NOPASSWD: /usr/bin/python3 /var/www/html/hardwareAdapter.py *" > /etc/sudoers.d/python-gpio
RUN chmod 0440 /etc/sudoers.d/python-gpio

RUN pip3 install RPi.GPIO --break-system-packages

RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

COPY ./api/ /var/www/html/

COPY apache-cors.conf /etc/apache2/conf-available/cors.conf
RUN a2enconf cors

RUN touch /var/www/html/sequences.json && \
    chown www-data:www-data /var/www/html/sequences.json

EXPOSE 80