module.exports = {
  apps: [
    {
      name: 'dev-server',
      script: 'npm',
      args: 'run dev',
      cwd: '/root/pottur-school-connect',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 8081
      },
      error_file: './logs/dev-server-error.log',
      out_file: './logs/dev-server-out.log',
      log_file: './logs/dev-server-combined.log',
      time: true
    }
  ]
};
