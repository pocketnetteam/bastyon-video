Требования к видео ноде:
OS Linux Debian 10+
6+ ядер ЦПУ
6+ РАМ
20GB Boot Disk Drive

------------------------------------------------
Вся установка производится в режиме sudo

------------------------------------------------
Установка Docker

Сохранить скрипт, дать права на запуск "chmod +x install_docker.sh"
Выполнить с правами "./install_docker.sh"
После установки необходимо перелогиниться


Подготовка каталогов
------------------------------------------------
mkdir -p /peertube/data/nginx/conf.d
mkdir -p /peertube/storage


Подготовка диска-хранилища
------------------------------------------------
sudo fdisk -l    - найти требуемый диск (удалить разделы если необходимо)
parted /dev/vdb
> mklabel gpt
> mkpart primary ext4 0% 100%
> quit

# Примонтировать диск
# Добавить в файл /etc/fstab строку (с правами sudo)
/dev/vdb1 /peertube/storage ext4 discard,nofail,defaults 0 0


Настройка окружения
------------------------------------------------
Скопировать файлы в каталог /peertube
Настроить IP и Домен

.env
docker-compose.yml


Подготовка NGINX для получения сертификата
------------------------------------------------
Скопировать файлы

nginx/nginx.conf -> /peertube/data/nginx/nginx.conf
nginx/conf.d/peertube.template.init -> /peertube/data/nginx/conf.d/peertube.template


Генерация сертификата
------------------------------------------------
Crjgbhjdfnm скрипт и дать права на запуск "chmod +x init-letsencrypt.sh"
! Указать домен в скрипте
! Настроить домен на IP машины

Запустить генерацию сертификата:
sudo ./init-letsencrypt.sh


Продакшн настройка
------------------------------------------------
Скопировать
nginx/conf.d/peertube.template -> /peertube/data/nginx/conf.d/peertube.template

Запуск
------------------------------------------------
dc up -d


Смена пароля рута peertube
------------------------------------------------
docker exec -it peertube /bin/bash
NODE_CONFIG_DIR=/app/config NODE_ENV=production npm run reset-password -- -u root

Установка плагина PocketnetAuth
------------------------------------------------
Администрирование - Плагины - "pocketnet" - Установить pocketnet-auth


Настройка федерации
------------------------------------------------
Администрирование - Федерация - Ваши Подписки
-> Подписаться










