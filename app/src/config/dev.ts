import { secretsDev } from './secrets-dev';


interface Secrets {
  redis_host: string;
  redis_password: string;
  pg_host: string;
  pg_user: string;
  pg_password: string;
  cf_auth_headers: { [key: string]: any };
}

const secrets: Secrets = secretsDev;

// Define interfaces/types for each nested object
interface ClientConfig {
  environment: 'dev' | 'prod'; // Assuming only dev and prod environments are possible, adjust accordingly
}

interface UploadConfig {
  fileSizeLimit: number; // in bytes
  avatarSizeLimit: number; // in bytes
}

interface TimezoneConfig {
  postgres: string;
  tzoffset: number; // in milliseconds
}

interface RedisConfig {
  port: number;
  host: string;
  password: string;
  family: 4 | 6; // 4 (IPv4) or 6 (IPv6)
  db: number;
}

interface KnexConnectionConfig {
  host: string;
  user: string;
  password: string;
  database: string;
}

interface KnexConfig {
  pool: { afterCreate(connection: any, callback: any): void; };
  client: 'pg'; // Assuming the only supported client is pg, adjust accordingly
  connection: KnexConnectionConfig;
}

interface TrustedHostsConfig {
  [key: string]: boolean;
}

interface CFPurgeCacheDefaultOptions {
  method: 'POST' | 'GET' | 'PUT' | 'DELETE'; // Adjust according to your needs
  url: string;
  headers: { [key: string]: string };
}

interface CFPurgeCacheConfig {
  prependPath: null | string; // or you could specify a more precise type if possible
  defaultOptions: CFPurgeCacheDefaultOptions;
}

// Define the main ConfigDev interface
export interface Config {
  clientConfig: ClientConfig;
  upload: UploadConfig;
  timezone: TimezoneConfig;
  redis: RedisConfig;
  knex: KnexConfig;
  trustedHosts: TrustedHostsConfig;
  cfPurgeCache: CFPurgeCacheConfig;
  selfBaseURL: string;
  jwtSecret: string;
  firebase: {
    serviceAccountPath: string;
    databaseURL: string;
  };
}

export const configDev: Config = {
  clientConfig: {
    environment: 'dev'
  },
  upload: {
    fileSizeLimit: 100 * 1024 * 1024, // 100MB,
    avatarSizeLimit: 10 * 1024 * 1024 // 10MB,
  },
  timezone: {
    postgres: 'Asia/Hong_Kong',
    tzoffset: 8 * 60 * 60 * 1000
  },
  redis: {
    port: 6379, // Redis port
    host: secrets.redis_host, // Redis host
    password: secrets.redis_password,
    family: 4, // 4 (IPv4) or 6 (IPv6)
    db: 0
  },
  knex: {
    client: 'pg',
    connection: {
      host: secrets.pg_host,
      user: secrets.pg_user,
      password: secrets.pg_password,
      database: 'app_backend_dev'
    },
    pool: {
      afterCreate: function (connection: any, callback: any): void {
        throw new Error('Function not implemented.');
      }
    }
  },
  trustedHosts: {
    localhost: true,
    '127.0.0.1': true,
    'domain.tld': true,
    'dev.domain.tld': true,
    'docs.domain.tld': true,
    '192.168.1.223': true,
    '192.168.1.14': true
  },
  cfPurgeCache: {
    prependPath: null,
    defaultOptions: {
      method: 'POST',
      url: 'https://api.cloudflare.com/client/v4/zones/xxx/purge_cache',
      headers: secrets.cf_auth_headers
    }
  },
  selfBaseURL: 'https://api.domain.tld',
  jwtSecret: 'jwt_secret',
  firebase: {
    serviceAccountPath: './credentials/firebase.json',
    databaseURL: 'https://xxx.firebaseio.com/'
  }
};