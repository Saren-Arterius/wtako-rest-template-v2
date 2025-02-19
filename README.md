# What is this
- Docker compose
- node23 w/typescript web server base
- pgsql17 w/pgroonga
- pgadmin

# Deploy environment
Ensure docker-compose installed:
1. `# apt update && apt upgrade`
2. `# apt install docker-compose`

# Build and start server (also starts on boot)
1. `# ./start.sh`

# Access web
1. `$ ssh <server ip> -L 31380:localhost:31380`
2. Ensure server started
3. Open http://localhost:31380/

# Access pgAdmin
1. `$ ssh <server ip> -L 31300:localhost:31300`
2. Ensure server started
3. Open http://localhost:31300/browser/
4. Login (email: admin@example.com, password: pgadmin_password)
5. Create new server (host: postgres, username: postgres, password: pg_password)

# Password strings to find and replace
- `pg_password`
- `pgadmin_password`
- `redis_password`
- `jwt_secret`

# Update from git, rebuild docker image if needed, and restart server (also starts on boot)
1. `# ./update-restart.sh`

# Reset & delete data of postgres & redis
1. `# ./reset.sh`

# Change postgres schema without adding migration file & keep existing data (dangerous on production)
1. `# ./revolute-db.sh`

# Backup to app_backup_$(hostname)_$(date +%Y%m%d_%H%M%S).tar.gz
1. `# ./backup.sh`