# Bastyon Video Servers - Documentation Index

This document provides an overview of all available documentation for the Bastyon Video Servers project.

## Project Documentation

### [ARCHITECTURE.md](./ARCHITECTURE.md)
Comprehensive technical architecture documentation covering:
- System architecture and components
- Directory structure
- Core functionality (video management, live streaming, federation)
- Database schema and storage architecture
- Job queue system
- API structure
- Security features
- Performance optimization
- Monitoring and maintenance

### [BASTYON_DEPLOYMENT.md](./BASTYON_DEPLOYMENT.md)
Docker deployment guide covering:
- System requirements
- Quick start guide
- Docker Compose service details
- Network configuration
- Configuration management
- Bastyon-specific integration with Pocketnet
- Step-by-step deployment instructions
- Upgrade procedures
- Monitoring and maintenance
- Backup strategies
- Troubleshooting common issues

### [README.md](./README.md)
Original PeerTube README with:
- Project introduction
- Features overview
- Contributing guidelines
- Installation instructions
- Links to official documentation

## Cursor AI Rules

The project includes Cursor AI rules in `.cursor/rules/` to provide consistent coding guidance:

### [project-overview.mdc](./.cursor/rules/project-overview.mdc)
**Applied**: Always
- Project context and overview
- Technology stack
- Directory structure
- Common operations and workflows
- Development commands
- Important gotchas

### [backend-typescript.mdc](./.cursor/rules/backend-typescript.mdc)
**Applied**: When working with `server/**/*.ts`
- Error handling patterns
- Async/await best practices
- Sequelize model usage
- Logger usage
- Transaction handling
- Type imports
- Validation patterns
- Job queue patterns

### [api-controllers.mdc](./.cursor/rules/api-controllers.mdc)
**Applied**: When working with `server/controllers/**/*.ts`
- Controller structure
- Handler functions
- Response formatting
- Middleware ordering
- Pagination
- File upload handling
- ActivityPub controllers

### [database-models.mdc](./.cursor/rules/database-models.mdc)
**Applied**: When working with `server/models/**/*.ts`
- Model definition with Sequelize-TypeScript
- Association patterns
- Scopes for common queries
- Static and instance methods
- Lifecycle hooks
- Transaction usage
- Query optimization
- Type safety

### [angular-frontend.mdc](./.cursor/rules/angular-frontend.mdc)
**Applied**: When working with `client/src/**/*.ts`
- Component structure
- Service patterns
- RxJS best practices
- Template best practices
- Reactive forms
- State management
- Performance optimization
- Error handling

### [job-queue-patterns.mdc](./.cursor/rules/job-queue-patterns.mdc)
**Applied**: When working with `server/lib/job-queue/**/*.ts`
- Job handler structure
- Queue configuration
- Creating jobs
- Job priorities
- Error handling and retries
- Progress tracking
- Cleanup patterns

### [activitypub-federation.mdc](./.cursor/rules/activitypub-federation.mdc)
**Applied**: When working with `server/lib/activitypub/**/*.ts`
- Activity creation
- HTTP signature signing and verification
- Inbox processing
- Outbox implementation
- Fetching remote objects
- Following and followers
- Broadcasting activities
- Error handling

## Quick Reference

### Project Structure
```
bastyon-video/
├── server/              # Backend Node.js/Express application
├── client/              # Frontend Angular application
├── shared/              # Shared TypeScript code
├── config/              # Configuration files
├── scripts/             # CLI utilities
├── support/             # Docker and documentation
├── .cursor/
│   └── rules/          # Cursor AI rules for coding guidance
├── ARCHITECTURE.md     # Technical architecture documentation
├── BASTYON_DEPLOYMENT.md  # Deployment guide
└── DOCUMENTATION_INDEX.md  # This file
```

### Key Technologies
- **Backend**: Node.js 16+, Express, TypeScript, Sequelize
- **Frontend**: Angular, RxJS, Video.js
- **Database**: PostgreSQL 13+
- **Cache/Queue**: Redis 6, Bull
- **Video Processing**: FFmpeg
- **P2P**: WebTorrent
- **Federation**: ActivityPub
- **Deployment**: Docker, Docker Compose

### Development Workflow

1. **Setup**:
   ```bash
   npm install
   cd client && npm install
   ```

2. **Development**:
   ```bash
   npm run dev              # Full stack
   npm run dev:server      # Backend only
   npm run dev:client      # Frontend only
   ```

3. **Build**:
   ```bash
   npm run build
   ```

4. **Test**:
   ```bash
   npm test
   ```

### Docker Deployment

1. **Configure**:
   ```bash
   cp config/production.yaml.example config/production.yaml
   # Edit configuration
   ```

2. **Deploy**:
   ```bash
   docker-compose up -d
   ```

3. **Monitor**:
   ```bash
   docker-compose logs -f peertube
   ```

### Common Tasks

#### Video Management
```bash
# Create transcoding job
npm run create-transcoding-job -- -v <video-uuid> -r 1080

# Regenerate thumbnails
npm run regenerate-thumbnails

# Prune orphaned files
npm run prune-storage
```

#### Database
```bash
# Backup
docker-compose exec postgres pg_dump -U peertube peertube > backup.sql

# Restore
docker-compose exec -T postgres psql -U peertube peertube < backup.sql
```

#### Logs
```bash
# Application logs
docker-compose exec peertube tail -f /data/logs/peertube.log

# Container logs
docker-compose logs -f peertube
```

## External Resources

### PeerTube Official Documentation
- **Website**: https://joinpeertube.org
- **Documentation**: https://docs.joinpeertube.org
- **API Reference**: https://docs.joinpeertube.org/api-rest-reference.html
- **Architecture**: https://docs.joinpeertube.org/contribute-architecture
- **ActivityPub**: https://docs.joinpeertube.org/api-activitypub

### Bastyon/Pocketnet
- **Bastyon**: https://bastyon.com
- **Pocketnet**: https://pocketnet.app

### Related Technologies
- **ActivityPub Spec**: https://www.w3.org/TR/activitypub/
- **WebTorrent**: https://webtorrent.io
- **FFmpeg**: https://ffmpeg.org
- **Sequelize**: https://sequelize.org
- **Angular**: https://angular.io
- **Bull**: https://github.com/OptimalBits/bull

## Contributing

When contributing to this project:

1. **Read the Rules**: Cursor will automatically apply relevant rules based on the files you're working with
2. **Follow Patterns**: Check existing code for established patterns
3. **Test Changes**: Run tests before committing
4. **Document**: Update documentation for significant changes
5. **Review Architecture**: Consult `ARCHITECTURE.md` for system understanding

## Getting Help

If you need assistance:

1. Check this documentation index
2. Read relevant architecture documentation
3. Review Cursor rules for code patterns
4. Examine existing code for examples
5. Consult PeerTube official documentation
6. Check test files for usage examples

## License

AGPL-3.0 - See LICENSE file

---

*Last Updated: January 2026*
*Project Version: 4.2.2 (PeerTube base) + Bastyon customizations*
