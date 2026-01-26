# Bastyon Video Servers - Deployment Guide

## Overview

This document describes the Docker-based deployment of Bastyon Video Servers, a customized PeerTube instance integrated with the Pocketnet/Bastyon ecosystem.

## Prerequisites

### System Requirements

**Minimum**:
- CPU: 2 cores
- RAM: 2GB
- Storage: 20GB (+ video storage)
- OS: Linux (Ubuntu 20.04+, Debian 11+)

**Recommended**:
- CPU: 4+ cores (for transcoding)
- RAM: 4GB+
- Storage: 100GB+ SSD
- Network: 100Mbps+ bandwidth

### Software Requirements

- Docker 20.10+
- Docker Compose 1.29+
- Domain name with DNS configured
- (Optional) S3-compatible object storage

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url> bastyon-video
cd bastyon-video
```

### 2. Configure Environment

```bash
# Copy example configuration
cp config/production.yaml.example config/production.yaml

# Edit configuration
nano config/production.yaml
```

### 3. Start Services

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f peertube

# Wait for initialization (first run takes several minutes)
```

### 4. Access Instance

- Web Interface: `https://your-domain.com`
- Default admin: Set during first-time setup wizard

## Docker Compose Architecture

### Services Overview

```yaml
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  webserver  │────▶│  peertube   │────▶│  postgres   │
│   (nginx)   │     │  (node.js)  │     │   (db)      │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                    
       │                   ▼                    
┌─────────────┐     ┌─────────────┐            
│   certbot   │     │    redis    │            
│   (ssl)     │     │  (cache)    │            
└─────────────┘     └─────────────┘            
                           │
                    ┌─────────────┐
                    │  postfix    │
                    │  (email)    │
                    └─────────────┘
```

### Service Details

#### 1. PeerTube (Main Application)

**Image**: Custom Node.js 16 on Debian Bullseye

**Responsibilities**:
- Express.js API server
- Video transcoding with FFmpeg
- RTMP server for live streaming
- WebTorrent tracker
- Job queue processing

**Ports**:
- `9000`: HTTP API (internal only)
- `1935`: RTMP/RTMPS (internal only)

**Volumes**:
- `./data:/data`: Video storage, thumbnails, logs
- `./config:/config`: Configuration files

**Environment Variables**:
```bash
PEERTUBE_DB_USERNAME=peertube
PEERTUBE_DB_PASSWORD=<secure-password>
PEERTUBE_DB_HOSTNAME=postgres
PEERTUBE_WEBSERVER_HOSTNAME=video.bastyon.com
PEERTUBE_TRUST_PROXY=["172.18.0.0/16"]
PEERTUBE_SMTP_HOSTNAME=postfix
PEERTUBE_ADMIN_EMAIL=admin@bastyon.com
```

**Health Check**:
```bash
curl http://172.18.0.42:9000/api/v1/ping
```

#### 2. Webserver (Nginx)

**Image**: nginx:alpine

**Responsibilities**:
- Reverse proxy to PeerTube
- SSL/TLS termination
- Static file serving
- Rate limiting
- Caching

**Ports**:
- `80`: HTTP (redirects to HTTPS)
- `443`: HTTPS

**Configuration**:
```nginx
# /etc/nginx/conf.d/peertube.conf
upstream peertube {
  server 172.18.0.42:9000;
}

server {
  listen 443 ssl http2;
  server_name video.bastyon.com;
  
  # SSL certificates
  ssl_certificate /etc/letsencrypt/live/video.bastyon.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/video.bastyon.com/privkey.pem;
  
  # Proxy to PeerTube
  location / {
    proxy_pass http://peertube;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Host $host;
  }
  
  # WebSocket for tracker
  location /tracker/socket {
    proxy_pass http://peertube;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
  
  # Client body size for uploads
  client_max_body_size 8G;
}
```

#### 3. Certbot (SSL Management)

**Image**: certbot/certbot

**Responsibilities**:
- Obtain Let's Encrypt SSL certificates
- Automatic renewal

**Volumes**:
- `certbot-config:/etc/letsencrypt`
- `certbot-www:/var/www/certbot`

**Initial Certificate**:
```bash
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d video.bastyon.com \
  --email admin@bastyon.com \
  --agree-tos \
  --non-interactive
```

**Renewal** (cron):
```bash
0 0 * * * docker-compose run --rm certbot renew --quiet
```

#### 4. PostgreSQL (Database)

**Image**: postgres:13-alpine

**Responsibilities**:
- Primary data storage
- User accounts, videos, metadata
- ActivityPub actors and activities

**Ports**:
- `5432`: PostgreSQL (internal only)

**Volumes**:
- `postgres-data:/var/lib/postgresql/data`

**Extensions**:
- `pg_trgm`: Trigram search
- `unaccent`: Accent-insensitive search

**Backup**:
```bash
docker-compose exec postgres pg_dump -U peertube peertube > backup.sql
```

**Restore**:
```bash
docker-compose exec -T postgres psql -U peertube peertube < backup.sql
```

#### 5. Redis (Cache & Queue)

**Image**: redis:6-alpine

**Responsibilities**:
- Job queue backend (Bull)
- API response caching
- Session storage

**Ports**:
- `6379`: Redis (internal only)

**Volumes**:
- `redis-data:/data`

**Persistence**:
- AOF (Append Only File) enabled
- Snapshots every 60 seconds

**Monitoring**:
```bash
docker-compose exec redis redis-cli INFO
docker-compose exec redis redis-cli MONITOR
```

#### 6. Postfix (Email)

**Image**: mwader/postfix-relay

**Responsibilities**:
- SMTP relay for outgoing emails
- User notifications
- Password resets

**Ports**:
- `25`: SMTP (internal only)

**Environment**:
```bash
POSTFIX_myhostname=video.bastyon.com
POSTFIX_relayhost=[smtp.gmail.com]:587
POSTFIX_smtp_sasl_auth_enable=yes
POSTFIX_smtp_sasl_password_maps=static:username:password
```

## Network Configuration

### Docker Network

**Type**: Bridge network with custom subnet

**Configuration**:
```yaml
networks:
  default:
    driver: bridge
    ipam:
      config:
        - subnet: 172.18.0.0/16
```

**Static IPs**:
- PeerTube: `172.18.0.42`

### Port Mapping

| Service | Internal Port | External Port | Purpose |
|---------|---------------|---------------|---------|
| Nginx | 80/443 | 80/443 | HTTP/HTTPS |
| PeerTube | 9000 | - | API (internal) |
| PeerTube | 1935 | - | RTMP (internal) |
| PostgreSQL | 5432 | - | Database (internal) |
| Redis | 6379 | - | Cache (internal) |
| Postfix | 25 | - | SMTP (internal) |

### Firewall Rules

```bash
# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Optional: Allow RTMP from specific IPs
# ufw allow from <trusted-ip> to any port 1935
```

## Configuration

### Main Configuration File

**Path**: `./config/production.yaml`

**Structure**:
```yaml
# Server
webserver:
  https: true
  hostname: 'video.bastyon.com'
  port: 443

# Database
database:
  hostname: 'postgres'
  port: 5432
  name: 'peertube'
  username: 'peertube'
  password: 'secure-password'

# Redis
redis:
  hostname: 'redis'
  port: 6379
  auth: null
  db: 0

# Storage
storage:
  tmp: '/data/tmp/'
  avatars: '/data/avatars/'
  videos: '/data/videos/'
  streaming_playlists: '/data/streaming-playlists/'
  redundancy: '/data/redundancy/'
  logs: '/data/logs/'
  previews: '/data/previews/'
  thumbnails: '/data/thumbnails/'
  torrents: '/data/torrents/'
  captions: '/data/captions/'
  cache: '/data/cache/'
  plugins: '/data/plugins/'
  client_overrides: '/data/client-overrides/'

# Transcoding
transcoding:
  enabled: true
  allow_additional_extensions: true
  allow_audio_files: true
  threads: 4
  concurrency: 1
  resolutions:
    0p: false
    144p: false
    240p: false
    360p: true
    480p: true
    720p: true
    1080p: true
    1440p: false
    2160p: false
  webtorrent:
    enabled: true
  hls:
    enabled: true

# Live streaming
live:
  enabled: true
  allow_replay: true
  max_duration: -1  # Unlimited
  max_instance_lives: -1  # Unlimited
  max_user_lives: -1  # Unlimited
  transcoding:
    enabled: true
    threads: 4
    resolutions:
      144p: false
      240p: false
      360p: true
      480p: true
      720p: true
      1080p: true
      1440p: false
      2160p: false

# Import
import:
  videos:
    http:
      enabled: true
    torrent:
      enabled: true

# Federation
federation:
  enabled: true

# Email
smtp:
  hostname: 'postfix'
  port: 25
  username: null
  password: null
  tls: false
  disable_starttls: false
  from_address: 'noreply@video.bastyon.com'

# Admin
admin:
  email: 'admin@bastyon.com'

# Contact
contact_form:
  enabled: true

# User registration
signup:
  enabled: true
  limit: -1  # Unlimited
  requires_email_verification: false
  filters:
    cidr:
      whitelist: []
      blacklist: []

# User
user:
  video_quota: -1  # Unlimited
  video_quota_daily: -1  # Unlimited

# Plugins
plugins:
  index:
    enabled: true
    check_latest_versions_interval: 43200000  # 12 hours
```

### Object Storage Configuration

**S3-Compatible (AWS, MinIO, etc.)**:

```yaml
object_storage:
  enabled: true
  endpoint: 's3.amazonaws.com'  # or MinIO URL
  region: 'us-east-1'
  
  credentials:
    access_key_id: 'your-access-key'
    secret_access_key: 'your-secret-key'
  
  max_upload_part: 104857600  # 100MB
  
  videos:
    bucket_name: 'bastyon-videos'
    prefix: 'videos/'
    base_url: 'https://cdn.bastyon.com/videos/'
  
  streaming_playlists:
    bucket_name: 'bastyon-playlists'
    prefix: 'streaming/'
    base_url: 'https://cdn.bastyon.com/streaming/'
```

**Migration to Object Storage**:
```bash
# Move existing videos to object storage
npm run create-move-video-storage-job -- -o
```

### Environment Variables

**Create `.env` file**:
```bash
# Database
POSTGRES_USER=peertube
POSTGRES_PASSWORD=<secure-random-password>
POSTGRES_DB=peertube

# PeerTube
PEERTUBE_DB_USERNAME=peertube
PEERTUBE_DB_PASSWORD=<same-as-above>
PEERTUBE_DB_HOSTNAME=postgres
PEERTUBE_WEBSERVER_HOSTNAME=video.bastyon.com
PEERTUBE_TRUST_PROXY=["172.18.0.0/16"]
PEERTUBE_SMTP_HOSTNAME=postfix
PEERTUBE_SMTP_PORT=25
PEERTUBE_SMTP_FROM=noreply@video.bastyon.com
PEERTUBE_ADMIN_EMAIL=admin@bastyon.com

# Redis
REDIS_HOSTNAME=redis

# Optional: Object Storage
PEERTUBE_OBJECT_STORAGE_ENABLED=false
PEERTUBE_OBJECT_STORAGE_ENDPOINT=s3.amazonaws.com
PEERTUBE_OBJECT_STORAGE_REGION=us-east-1
PEERTUBE_OBJECT_STORAGE_ACCESS_KEY=your-key
PEERTUBE_OBJECT_STORAGE_SECRET_KEY=your-secret
```

## Bastyon-Specific Integration

### Pocketnet Authentication Plugin

**Plugin**: `peertube-plugin-pocketnet-auth` (v0.7.11)

**Purpose**: Integrate PeerTube authentication with Pocketnet blockchain

**Installation** (pre-installed in dependencies):
```json
{
  "dependencies": {
    "peertube-plugin-pocketnet-auth": "^0.7.11"
  }
}
```

**Configuration**:
Access via admin panel: Settings > Plugins > `peertube-plugin-pocketnet-auth`

**Features**:
- SSO with Pocketnet accounts
- User profile synchronization
- Blockchain-based authentication

### Pocketnet Core Integration

**Related Service**: `../pocketnet/`

**Communication**:
- PeerTube queries Pocketnet API for authentication
- User data synchronized from blockchain
- Video metadata potentially stored on-chain

**Network Considerations**:
- Both services should be on same Docker network
- Or configure API endpoint in plugin settings

## Deployment Steps

### Initial Deployment

```bash
# 1. Prepare environment
git clone <repo> bastyon-video
cd bastyon-video

# 2. Configure
cp config/production.yaml.example config/production.yaml
nano config/production.yaml
nano .env

# 3. Build and start
docker-compose build
docker-compose up -d

# 4. Check logs
docker-compose logs -f peertube

# 5. Wait for initialization (3-5 minutes)

# 6. Obtain SSL certificate
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d video.bastyon.com \
  --email admin@bastyon.com \
  --agree-tos

# 7. Restart nginx
docker-compose restart webserver

# 8. Access instance
# Navigate to https://video.bastyon.com
# Complete first-time setup wizard
```

### Upgrade Process

```bash
# 1. Backup database
docker-compose exec postgres pg_dump -U peertube peertube > backup-$(date +%Y%m%d).sql

# 2. Backup configuration
cp -r config config-backup-$(date +%Y%m%d)

# 3. Stop services
docker-compose down

# 4. Pull latest changes
git pull origin main

# 5. Rebuild
docker-compose build

# 6. Start services
docker-compose up -d

# 7. Check logs for migration success
docker-compose logs -f peertube

# 8. Verify instance
curl https://video.bastyon.com/api/v1/config
```

## Monitoring & Maintenance

### Health Checks

```bash
# Check all services
docker-compose ps

# Check PeerTube health
docker-compose exec peertube curl http://localhost:9000/api/v1/ping

# Check database
docker-compose exec postgres pg_isready -U peertube

# Check Redis
docker-compose exec redis redis-cli ping
```

### Logs

```bash
# Follow all logs
docker-compose logs -f

# Service-specific logs
docker-compose logs -f peertube
docker-compose logs -f postgres
docker-compose logs -f redis

# Application logs (inside container)
docker-compose exec peertube tail -f /data/logs/peertube.log
```

### Resource Monitoring

```bash
# Docker stats
docker stats

# Disk usage
docker-compose exec peertube df -h /data

# Database size
docker-compose exec postgres psql -U peertube -c "SELECT pg_size_pretty(pg_database_size('peertube'));"
```

### Backup Strategy

**Database**:
```bash
#!/bin/bash
# backup-db.sh
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d-%H%M%S)

docker-compose exec -T postgres pg_dump -U peertube peertube | \
  gzip > "$BACKUP_DIR/peertube-$DATE.sql.gz"

# Keep last 30 days
find "$BACKUP_DIR" -name "peertube-*.sql.gz" -mtime +30 -delete
```

**Videos** (if using local storage):
```bash
#!/bin/bash
# backup-videos.sh
BACKUP_DIR="/backups/videos"
DATE=$(date +%Y%m%d)

rsync -av --progress ./data/videos/ "$BACKUP_DIR/$DATE/"
```

**Configuration**:
```bash
#!/bin/bash
# backup-config.sh
tar -czf config-backup-$(date +%Y%m%d).tar.gz config/
```

### Maintenance Tasks

**Prune Storage** (remove orphaned files):
```bash
docker-compose exec peertube npm run prune-storage
```

**Regenerate Thumbnails**:
```bash
docker-compose exec peertube npm run regenerate-thumbnails
```

**Create Transcoding Job**:
```bash
docker-compose exec peertube npm run create-transcoding-job -- \
  -v <video-uuid> \
  -r 1080
```

**Database Vacuum**:
```bash
docker-compose exec postgres vacuumdb -U peertube -d peertube --analyze
```

## Troubleshooting

### Common Issues

#### PeerTube won't start
```bash
# Check logs
docker-compose logs peertube

# Common causes:
# - Database not ready: Wait longer
# - Configuration error: Check production.yaml
# - Port conflict: Check if 9000 is in use
```

#### SSL certificate issues
```bash
# Check certificate validity
docker-compose exec webserver nginx -t

# Renew certificate
docker-compose run --rm certbot renew --force-renewal

# Restart nginx
docker-compose restart webserver
```

#### Transcoding failures
```bash
# Check FFmpeg
docker-compose exec peertube ffmpeg -version

# Check disk space
docker-compose exec peertube df -h

# Check transcoding queue
docker-compose exec peertube curl http://localhost:9000/api/v1/jobs?state=active
```

#### Database connection issues
```bash
# Check PostgreSQL is running
docker-compose exec postgres pg_isready -U peertube

# Check credentials in .env and production.yaml match

# Test connection
docker-compose exec peertube psql -h postgres -U peertube -d peertube
```

#### Federation not working
```bash
# Check HTTPS is working
curl -I https://video.bastyon.com

# Check ActivityPub endpoint
curl https://video.bastyon.com/.well-known/webfinger?resource=acct:username@video.bastyon.com

# Check HTTP signatures in logs
docker-compose logs peertube | grep signature
```

### Performance Tuning

**Transcoding**:
```yaml
transcoding:
  threads: 4  # Set to number of CPU cores
  concurrency: 2  # Number of parallel transcoding jobs
```

**Database**:
```bash
# Increase PostgreSQL performance
# Edit postgres config
docker-compose exec postgres psql -U peertube
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '128MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
SELECT pg_reload_conf();
```

**Redis**:
```bash
# Increase memory
docker-compose exec redis redis-cli CONFIG SET maxmemory 512mb
docker-compose exec redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

## Security Best Practices

1. **Strong Passwords**: Use random passwords for database and admin
2. **Firewall**: Only expose ports 80/443
3. **Updates**: Keep Docker images updated
4. **Backups**: Regular automated backups
5. **HTTPS Only**: Enforce HTTPS, disable HTTP
6. **Rate Limiting**: Configure in Nginx
7. **User Registration**: Moderate or disable if not needed
8. **Plugin Security**: Only install trusted plugins
9. **File Permissions**: Ensure proper ownership of volumes
10. **Monitoring**: Set up alerts for unusual activity

## Support & Resources

- **Bastyon**: https://bastyon.com
- **Pocketnet**: https://pocketnet.app
- **PeerTube Documentation**: https://docs.joinpeertube.org
- **Docker Documentation**: https://docs.docker.com
