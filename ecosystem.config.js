module.exports = {
    apps: [
        {
            name: 'arya-bot-v3',
            script: 'index.js',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
            env: {
                NODE_ENV: 'production',
                MODE: 'prod'
            }
        },
        {
            name: 'arya-dashboard',
            script: 'pnpm',
            args: 'start',
            cwd: './dashboard',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            }
        }
    ]
};
