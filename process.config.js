module.exports = {
  apps: [
    {
      name: "fabric",
      cwd: "./",
      script: "./src/index.js",
      watch: false,
      ignore_watch: ["uploads"],
      env_production: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
      instances: 1,
      exec_mode: "cluster",
    },
  ],
};
