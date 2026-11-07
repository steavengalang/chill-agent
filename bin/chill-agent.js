#!/usr/bin/env node
import('../src/cli.js')
  .then(({ runCli }) => runCli())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
