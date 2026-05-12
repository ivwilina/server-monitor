module.exports = {
  apps: [
    {
      name: 'server-monit-api',
      cwd: './server',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
