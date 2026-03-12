# Internship Management System (Prakerin)

Laravel 12 backend + React (Vite) frontend for internship management.

## Production Checklist

- Configure production `.env` values.
- Install PHP/Composer dependencies without dev packages.
- Install Node dependencies and build frontend assets.
- Run database migrations with `--force`.
- Cache Laravel configuration/routes/views/events.
- Configure SMTP mail credentials.
- Enable scheduler and queue workers on the server.

## 1. Environment Variables

Use the provided template:

```bash
cp .env.production.example .env
```

Update at least these variables:

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://ims.example.com
APP_TIMEZONE=Asia/Makassar
CORS_ALLOWED_ORIGINS=https://ims.example.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=prakerin_management
DB_USERNAME=prakerin_user
DB_PASSWORD=your-db-password

QUEUE_CONNECTION=database
CACHE_STORE=database
SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true

MAIL_MAILER=smtp
MAIL_SCHEME=tls
MAIL_HOST=smtp.mailprovider.com
MAIL_PORT=587
MAIL_USERNAME=no-reply@example.com
MAIL_PASSWORD=your-smtp-password
MAIL_FROM_ADDRESS=no-reply@example.com
MAIL_FROM_NAME="Internship Management System"

VITE_API_BASE_URL=https://ims.example.com/api
```

Notes:
- `VITE_API_BASE_URL` can be `/api` if frontend and API share the same domain.
- If you set only a domain (for example `https://api.example.com`), frontend code now auto-appends `/api`.
- `CORS_ALLOWED_ORIGINS` accepts comma-separated origins for cross-domain frontend access.

## 2. Backend Production Optimization

Run from project root after `.env` is ready:

```bash
composer install --no-dev --optimize-autoloader
# run once on first deployment if APP_KEY is empty
php artisan key:generate
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan event:cache
php artisan view:cache
```

## 3. SMTP Email Configuration

Set SMTP variables in `.env` (`MAIL_*` values above), then clear and recache config:

```bash
php artisan config:clear
php artisan config:cache
```

Optional quick test:

```bash
php artisan tinker
```

```php
Illuminate\Support\Facades\Mail::raw('SMTP test from IMS', function ($message) {
    $message->to('admin@example.com')->subject('SMTP Test');
});
```

## 4. Frontend Build + Production API

```bash
npm ci
npm run build
```

Vite output will be generated in `public/build`, served by Laravel.

## 5. VPS Deployment (Ubuntu + Nginx + PHP-FPM)

Example commands:

```bash
sudo apt update
sudo apt install -y nginx git unzip curl supervisor mysql-server redis-server
sudo apt install -y php8.3-fpm php8.3-cli php8.3-mbstring php8.3-xml php8.3-curl php8.3-mysql php8.3-zip php8.3-bcmath php8.3-intl
```

Install Composer and Node.js (LTS), then deploy app:

```bash
cd /var/www
git clone <your-repo-url> prakerin-app
cd prakerin-app
cp .env.production.example .env

composer install --no-dev --optimize-autoloader
npm ci
npm run build

# run once on first deployment if APP_KEY is empty
php artisan key:generate
php artisan migrate --force
php artisan storage:link

php artisan config:cache
php artisan route:cache
php artisan event:cache
php artisan view:cache

sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R ug+rwx storage bootstrap/cache
```

Nginx virtual host example (`/etc/nginx/sites-available/prakerin-app`):

```nginx
server {
    listen 80;
    server_name ims.example.com;
    root /var/www/prakerin-app/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/prakerin-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl restart php8.3-fpm
```

## 6. Database Migration Instructions

Use this flow on every release:

```bash
# optional backup first (recommended)
# mysqldump -u <user> -p prakerin_management > backup.sql

php artisan migrate --force
```

For status checks:

```bash
php artisan migrate:status
```

## 7. Running Scheduler

Recommended: cron + `schedule:run`.

Open crontab:

```bash
crontab -e
```

Add:

```cron
* * * * * cd /var/www/prakerin-app && php artisan schedule:run >> /dev/null 2>&1
```

Useful checks:

```bash
php artisan schedule:list
php artisan schedule:run
```

Alternative long-running mode:

```bash
php artisan schedule:work
```

## 8. Running Queue Workers

Use Supervisor in production.

Create `/etc/supervisor/conf.d/prakerin-worker.conf`:

```ini
[program:prakerin-worker]
process_name=%(program_name)s_%(process_num)02d
command=/usr/bin/php /var/www/prakerin-app/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/prakerin-app/storage/logs/worker.log
stopwaitsecs=3600
```

Apply and start:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start prakerin-worker:*
sudo supervisorctl status
```

Queue operations:

```bash
php artisan queue:failed
php artisan queue:retry all
php artisan queue:restart
```

## 9. Ready-To-Copy Deployment Templates

Template files are available in this repository:

- `deploy/nginx/prakerin-app.conf`
- `deploy/supervisor/prakerin-worker.conf`
- `deploy/cron/prakerin-scheduler.cron`

Copy commands:

```bash
sudo cp deploy/nginx/prakerin-app.conf /etc/nginx/sites-available/prakerin-app
sudo ln -s /etc/nginx/sites-available/prakerin-app /etc/nginx/sites-enabled/prakerin-app
sudo nginx -t && sudo systemctl reload nginx
```

```bash
sudo cp deploy/supervisor/prakerin-worker.conf /etc/supervisor/conf.d/prakerin-worker.conf
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start prakerin-worker:*
```

```bash
crontab deploy/cron/prakerin-scheduler.cron
crontab -l
```
