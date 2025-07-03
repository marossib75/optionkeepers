#!/bin/bash

echo 'Launching the finance container...\n\n'

echo 'Migrating data'
python manage.py migrate

echo 'Moving react js assets'
rm -rf _static/js/build
cp -r /assets/js/build _static/js/build

if [ ! -f /finance_status/finance-init.flag ]; then

    echo "Init finance"
    python manage.py init-markets "_config/db/init.json"

    echo 'Create user admins'
    python manage.py createadmin --username team@finance.com --email team@finance.com --password admin --noinput
    python manage.py createadmin --username marco@finance.com --email marco@finance.com --password admin --noinput

    mkdir -p /data/finance_status/
    touch /finance_status/finance-init.flag

else
    echo "finance already initialized"
fi

if [ "$PRODUCTION" = True ]; then

    echo '\n'
    echo ' *****   *****      * *     * *       +'
    echo ' *    *  *    *   *     *   *    *    +'
    echo ' * **    * **     *     *   *    *    +'
    echo ' *       *  *     *     *   *    *     '
    echo ' *       *    *    * * *    * * *     +\n\n'

#    echo 'Copying Django static files to deploy in PRODUCTION!!!'
#    python manage.py collectstatic --noinput

    echo 'Starting gunicorn to serve the finance in PRODUCTION'
    gunicorn --config=gunicorn_config.py finance.wsgi

else 
    echo 'Starting development server'
    python manage.py runserver 0.0.0.0:8000
fi
