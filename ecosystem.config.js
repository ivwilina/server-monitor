module.exports = {
  apps: [
    {
      name: 'server-monit-api',
      cwd: './server',
      script: 'npm',
      args: 'run dev',
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
    },
    {
      name: 'server-monit-client',
      cwd: './client',
      script: 'npm',
      args: 'run dev',
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
