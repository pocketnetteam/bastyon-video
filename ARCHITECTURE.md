# Bastyon Video Servers - Architecture Documentation

## Overview

Bastyon Video Servers is a PeerTube-based (v4.2.2) federated video streaming platform customized for the Pocketnet/Bastyon ecosystem. It provides decentralized video hosting using ActivityPub federation and peer-to-peer (WebTorrent) distribution directly in web browsers.

## Core Technologies

- **Backend**: Node.js 16+ with Express.js
- **Frontend**: Angular SPA with TypeScript
- **Database**: PostgreSQL 13 with Sequelize ORM
- **Cache/Queue**: Redis 6 with Bull job queue
- **Video Processing**: FFmpeg for transcoding
- **P2P Distribution**: WebTorrent/BitTorrent
- **Federation**: ActivityPub protocol
- **Container**: Docker with docker-compose

## System Architecture

```
┌─────────────────┐
│   Nginx Proxy   │ (Port 80/443)
│  SSL Termination│
└────────┬────────┘
         │
┌────────▼────────────────────────────────────────┐
│           PeerTube Application                  │
│  ┌──────────────┐      ┌──────────────┐        │
│  │   Express    │◄────►│   Angular    │        │
│  │   API Server │      │   Frontend   │        │
│  │  (Port 9000) │      │     SPA      │        │
│  └──────┬───────┘      └──────────────┘        │
│         │                                       │
│  ┌──────▼───────┐      ┌──────────────┐        │
│  │ RTMP Server  │      │  WebTorrent  │        │
│  │ (Port 1935)  │      │   Tracker    │        │
│  └──────────────┘      └──────────────┘        │
└────────┬────────────────────┬───────────────────┘
         │                    │
    ┌────▼────┐          ┌────▼────┐
    │PostgreSQL│         │  Redis   │
    │    DB    │         │  Cache   │
    └──────────┘         └──────────┘
```

## Directory Structure

### Backend (`/server`)

```
server/
├── controllers/          # Route handlers
│   ├── api/             # REST API endpoints
│   ├── activitypub/     # Federation endpoints
│   ├── feeds/           # RSS/Atom feeds
│   ├── static/          # Static file serving
│   └── live/            # Live streaming
├── models/              # Sequelize database models
│   ├── video/           # Video-related models
│   ├── account/         # User account models
│   ├── abuse/           # Moderation models
│   └── ...
├── lib/                 # Core business logic
│   ├── job-queue/       # Bull job queue handlers
│   ├── activitypub/     # Federation logic
│   ├── transcoding/     # Video transcoding
│   ├── live/            # Live streaming logic
│   ├── plugins/         # Plugin system
│   └── object-storage/  # S3/Object storage
├── middlewares/         # Express middlewares
│   ├── validators/      # Request validation
│   ├── auth.ts         # Authentication
│   └── ...
├── helpers/             # Utility functions
│   ├── ffmpeg/          # FFmpeg wrappers
│   ├── image.ts        # Image processing
│   └── ...
├── initializers/        # Application initialization
│   ├── config.ts       # Configuration loader
│   ├── database.ts     # Database setup
│   ├── migrations/     # DB migrations
│   └── installer.ts    # First-time setup
└── tools/              # CLI utilities
```

### Frontend (`/client`)

```
client/
├── src/
│   ├── app/                # Angular application
│   │   ├── core/          # Core services
│   │   ├── shared/        # Shared components
│   │   ├── +videos/       # Video features
│   │   ├── +accounts/     # Account features
│   │   ├── +admin/        # Admin panel
│   │   └── ...
│   ├── assets/            # Static assets
│   └── standalone/        # Embeddable player
└── ...
```

### Shared (`/shared`)

```
shared/
├── models/              # TypeScript interfaces
│   ├── videos/          # Video types
│   ├── users/           # User types
│   ├── activitypub/     # ActivityPub types
│   └── ...
└── core-utils/          # Shared utilities
```

## Core Components

### 1. Video Management

**Upload Flow**:
```
User Upload → Multer → Temporary Storage → Job Queue
                                              ↓
                                      Transcoding Jobs
                                              ↓
                        ┌─────────────────────┴─────────────────┐
                        ↓                                         ↓
                Video Files (multiple resolutions)    Streaming Playlists (HLS)
                        ↓                                         ↓
                Local Storage / Object Storage (S3)
                        ↓
                WebTorrent Creation → P2P Distribution
```

**Video Model**:
- Multiple formats: WebTorrent files + HLS playlists
- Multiple resolutions: 144p, 240p, 360p, 480p, 720p, 1080p, 1440p, 2160p
- Privacy levels: Public, Unlisted, Private, Internal
- States: Published, To Transcode, To Import, Waiting For Live, Live Ended
- Associated: Thumbnails, Previews, Captions, Tags

### 2. Transcoding Pipeline

**Transcoding Jobs** (`video-transcoding`):
1. **New Resolution**: Creates new video file at different resolution
2. **Optimize**: Optimizes original video (web compatibility)
3. **Merge Audio**: Merges separate audio stream

**HLS Transcoding**:
- Creates master playlist (m3u8)
- Generates segments (TS files)
- Creates variant playlists for each resolution
- Optimized for streaming

**Configuration**:
```typescript
transcoding:
  enabled: true
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
```

### 3. Live Streaming

**Architecture**:
```
OBS/Streaming Software → RTMP/RTMPS (Port 1935)
                              ↓
                    Node Media Server
                              ↓
                      FFmpeg Transcoding
                              ↓
                      HLS Output (m3u8)
                              ↓
                    Video.js Player (Client)
```

**Features**:
- RTMP/RTMPS ingestion
- Real-time transcoding to HLS
- Multiple latency modes (default, high definition, small latency)
- Live replay saving
- Permanent live streams

**Live Models**:
- `VideoLiveModel`: Live stream configuration
- `VideoLiveSessionModel`: Individual live sessions

### 4. Job Queue System

**Technology**: Bull (Redis-backed)

**Job Types**:

| Job Type | Description | Priority |
|----------|-------------|----------|
| `activitypub-http-broadcast` | Broadcast ActivityPub activities | High |
| `activitypub-http-unicast` | Send to specific actor | High |
| `activitypub-http-fetcher` | Fetch remote objects | Medium |
| `activitypub-follow` | Process follow requests | Medium |
| `video-transcoding` | Video encoding | Low |
| `video-import` | Import from external sources | Medium |
| `email` | Send emails | High |
| `move-to-object-storage` | Migrate to S3 | Low |
| `video-live-ending` | Process live endings | High |
| `videos-views-stats` | Aggregate statistics | Low |

**Queue Configuration**:
```typescript
redis:
  auth: null
  db: 0
  hostname: 'redis'
  port: 6379
  max_retries: 3
```

### 5. Federation (ActivityPub)

**Protocol**: ActivityPub (W3C standard)

**Core Concepts**:
- **Actors**: Users, Channels, Applications (have inbox/outbox)
- **Activities**: Create, Update, Delete, Follow, Like, Announce
- **Objects**: Video, Note (comments), Playlist

**Federation Flow**:
```
Local Activity → Outbox → Job Queue (broadcast)
                               ↓
                    Remote Instance Inboxes
                               ↓
                  HTTP Signature Verification
                               ↓
                      Process Activity
```

**Endpoints**:
- `/accounts/:name` - Actor profile
- `/video-channels/:name` - Channel profile
- `/videos/watch/:uuid` - Video object
- `/inbox` - Receive activities (POST)
- `/outbox` - Actor's public activities (GET)

**HTTP Signatures**:
- All ActivityPub requests signed with RSA keys
- Signatures verified on incoming requests
- Keys stored per actor in database

### 6. Storage Architecture

**Local Storage**:
```
storage/
├── videos/              # Original uploaded videos
├── streaming-playlists/ # HLS playlists and segments
├── redundancy/          # Cached remote videos
├── thumbnails/          # Video thumbnails
├── previews/            # Video previews
├── torrents/            # WebTorrent files
├── captions/            # Subtitle files
├── avatars/             # User avatars
└── logs/                # Application logs
```

**Object Storage (S3-compatible)**:
- Supports AWS S3, MinIO, DigitalOcean Spaces, etc.
- Separate buckets for videos and streaming playlists
- Multipart upload for large files
- CDN support via base URL
- Lazy migration via `move-to-object-storage` job

**Configuration**:
```yaml
object_storage:
  enabled: true
  endpoint: 's3.amazonaws.com'
  region: 'us-east-1'
  credentials:
    access_key_id: 'xxx'
    secret_access_key: 'xxx'
  max_upload_part: 100MB
  videos:
    bucket_name: 'peertube-videos'
    prefix: 'videos/'
  streaming_playlists:
    bucket_name: 'peertube-playlists'
    prefix: 'streaming-playlists/'
```

### 7. P2P Distribution (WebTorrent)

**How it Works**:
1. Video transcoded → `.torrent` files created
2. Server acts as WebSocket tracker
3. Clients connect to tracker via WebSocket
4. Peers discovered and connected via WebRTC
5. Video chunks shared between peers

**Benefits**:
- Reduces server bandwidth
- Scales with viewers
- Automatic for compatible browsers

**Tracker**:
- Built-in BitTorrent tracker (Port 9000)
- WebSocket-based for browser compatibility
- Announces: `/tracker/socket`

### 8. Plugin System

**Structure**:
```
plugins/
├── official/           # Official plugins
└── community/          # Community plugins
    └── node_modules/   # Installed plugins
```

**Bastyon-Specific Plugin**:
- `peertube-plugin-pocketnet-auth`: Pocketnet authentication integration

**Plugin Capabilities**:
- Server hooks: Modify behavior at runtime
- Client hooks: Modify UI/UX
- Themes: Custom styling
- Routes: Custom API endpoints
- Settings: Configurable options

**Hooks Examples**:
- `filter:api.video.upload.accept.result` - Control upload acceptance
- `action:api.video.uploaded` - Run after video upload
- `filter:html.client.json-ld.result` - Modify metadata

### 9. Authentication & Authorization

**OAuth2 Flow**:
```
Client → /api/v1/users/token (POST)
         username, password
              ↓
         Access Token + Refresh Token
              ↓
         API Requests with Bearer Token
```

**User Roles**:
- **Administrator**: Full system access
- **Moderator**: Content moderation
- **User**: Standard user permissions

**Permissions**:
- Video quota (daily/total)
- Live streaming enabled
- Video import enabled
- Auto-follow instance

**Bastyon Integration**:
- Custom authentication via `peertube-plugin-pocketnet-auth`
- Integration with Pocketnet accounts

### 10. Database Schema

**Key Tables**:

| Table | Purpose |
|-------|---------|
| `video` | Video metadata |
| `videoFile` | Individual video files |
| `videoStreamingPlaylist` | HLS playlists |
| `account` | User accounts |
| `actor` | ActivityPub actors |
| `user` | User credentials |
| `videoChannel` | Video channels |
| `videoComment` | Comments |
| `videoAbuse` | Abuse reports |
| `videoView` | View statistics |
| `videoShare` | Federated shares |
| `actorFollow` | Follow relationships |

**Relationships**:
```
User (1) ─┬─ Account (1) ─┬─ Actor (1)
          │                └─ VideoChannel (N) ─── Video (N)
          └─ UserNotification (N)

Video (1) ─┬─ VideoFile (N)
           ├─ VideoStreamingPlaylist (N)
           ├─ VideoComment (N)
           ├─ VideoTag (N) ── Tag (1)
           └─ VideoCaption (N)
```

### 11. API Structure

**REST API**: `/api/v1/`

**Major Endpoints**:

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/videos` | GET, POST, PUT, DELETE | Video management |
| `/videos/upload` | POST | Video upload |
| `/videos/:id/watching` | PUT | Update watch progress |
| `/video-channels` | GET, POST, PUT, DELETE | Channel management |
| `/video-playlists` | GET, POST, PUT, DELETE | Playlist management |
| `/users` | GET, POST, PUT, DELETE | User management |
| `/users/me` | GET, PUT | Current user |
| `/users/token` | POST | OAuth2 authentication |
| `/search/videos` | GET | Search videos |
| `/jobs` | GET | Job queue status |
| `/server/stats` | GET | Server statistics |

**Response Format**:
```json
{
  "total": 100,
  "data": [...]
}
```

### 12. Security Features

**Express Middlewares**:
- Helmet: Security headers (CSP, X-Frame-Options)
- CORS: Cross-origin resource sharing
- Rate Limiting: Prevent abuse
- Body Parser: Request parsing with size limits

**Content Security Policy**:
- Configurable CSP headers
- Script/style nonce support
- Frame embedding controls

**User Privacy**:
- IP anonymization
- DNT (Do Not Track) support
- Configurable analytics

**Video Privacy**:
- Public: Everyone can see
- Unlisted: Only with direct link
- Private: Only uploader
- Internal: Only logged-in users on instance

## Docker Deployment

### Services

```yaml
services:
  peertube:       # Main application (Node.js)
  webserver:      # Nginx reverse proxy
  certbot:        # SSL certificate management
  postgres:       # PostgreSQL database
  redis:          # Redis cache/queue
  postfix:        # SMTP relay
```

### Network Configuration

**Custom Bridge Network**: `172.18.0.0/16`

**Static IP**: PeerTube container at `172.18.0.42`

**Ports**:
- 80: HTTP (Nginx)
- 443: HTTPS (Nginx)
- 9000: PeerTube API (internal)
- 1935: RTMP (internal)

### Volumes

```yaml
volumes:
  peertube-data:     # Videos, images, etc.
  peertube-config:   # Configuration files
  postgres-data:     # Database data
  redis-data:        # Redis persistence
  certbot-config:    # SSL certificates
  certbot-www:       # ACME challenge
```

## Configuration

**Main Config**: `/config/production.yaml`

**Key Sections**:
- `webserver`: Domain, port, HTTPS
- `database`: PostgreSQL connection
- `redis`: Redis connection
- `storage`: File paths
- `object_storage`: S3 configuration
- `transcoding`: Encoding settings
- `live`: Live streaming settings
- `import`: Video import settings
- `federation`: ActivityPub settings

**Environment Variables**:
- `PEERTUBE_DB_USERNAME`
- `PEERTUBE_DB_PASSWORD`
- `PEERTUBE_WEBSERVER_HOSTNAME`
- `PEERTUBE_TRUST_PROXY`
- etc.

## Performance Optimization

### Caching Strategies

1. **Redis Caching**:
   - API responses
   - ActivityPub objects
   - View statistics

2. **File Caching**:
   - Thumbnails
   - Previews
   - Captions

3. **CDN Integration**:
   - Object storage with CDN
   - Static assets via Nginx

### Video Redundancy

**Purpose**: Cache videos from other instances

**Benefits**:
- Faster playback for remote videos
- Reduced load on origin instance
- Improved federation reliability

**Strategies**:
- Most views
- Trending
- Recently added

### Database Optimization

- Indexes on frequently queried columns
- Pagination for large result sets
- Materialized views for statistics
- Connection pooling

## Monitoring & Maintenance

### Logs

**Application Logs**: `/storage/logs/`
- `peertube.log`: Main application log
- `peertube-audit.log`: Security audit log

**Docker Logs**:
```bash
docker-compose logs -f peertube
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Metrics Endpoints

- `/api/v1/server/stats`: Server statistics
- `/api/v1/metrics`: Prometheus metrics (if enabled)

### Maintenance Tasks

**Automated via Schedulers**:
- Remove old jobs (7 days)
- Remove old views (60 days)
- Update video statistics
- Refresh remote actors
- Clean ActivityPub data

**Manual CLI Tools**:
```bash
npm run prune-storage        # Remove orphaned files
npm run regenerate-thumbnails # Regenerate thumbnails
npm run create-transcoding-job # Manually transcode
```

## Bastyon-Specific Customizations

### 1. Pocketnet Authentication

**Plugin**: `peertube-plugin-pocketnet-auth` (v0.7.11)

**Integration**:
- Custom authentication flow with Pocketnet blockchain
- User accounts linked to Pocketnet addresses
- Seamless SSO experience

### 2. Related Code

**Pocketnet Core**: `../pocketnet/`
- Blockchain node
- User authentication backend
- Integration APIs

### 3. Deployment Context

- Part of larger Bastyon ecosystem
- Docker-based deployment
- Integration with Pocketnet services

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install
cd client && npm install

# Development mode
npm run dev                  # All (client + server)
npm run dev:server          # Server only
npm run dev:client          # Client only

# Build for production
npm run build

# Run tests
npm test
```

### Database Migrations

```bash
# Create migration
npm run tsc -- scripts/migrations/create-migration.ts

# Run migrations (automatic on startup)
```

### Code Style

- **Backend**: ESLint with TypeScript
- **Frontend**: Angular style guide
- **Formatting**: StandardJS

## Troubleshooting

### Common Issues

**Video upload fails**:
- Check disk space
- Verify FFmpeg installation
- Check upload limits in config

**Live streaming not working**:
- Verify RTMP port (1935) open
- Check transcoding configuration
- Review FFmpeg logs

**Federation issues**:
- Verify HTTPS is working
- Check HTTP signature verification
- Review ActivityPub logs

**Performance issues**:
- Enable Redis caching
- Configure video redundancy
- Use object storage + CDN
- Increase transcoding threads

## Resources

- **Official PeerTube**: https://joinpeertube.org
- **Documentation**: https://docs.joinpeertube.org
- **API Reference**: https://docs.joinpeertube.org/api-rest-reference.html
- **Source Code**: https://github.com/Chocobozzz/PeerTube

## License

AGPL-3.0 - See LICENSE file
