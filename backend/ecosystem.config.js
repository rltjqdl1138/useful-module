'use strict';
module.exports = {
  apps: [
    {
      name: 'backend',
      script: './dist/www.js',
      watch: false,
      ignore_watch: ['[/\\]./', 'node_modules', 'logs', 'public'],
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'dev',
        instances: 1,
        SCHEME: 'http',
        HOST: '3.36.51.123',
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: 'prod',
        instances: 1,
        SCHEME: 'http',
        HOST: '3.36.51.123',
        PORT: 4000,
      },
    },
  ],
};
