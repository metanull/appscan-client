#!/usr/bin/env node

/**
 * Main entry point for Ink-based TUI
 * AppScan Vulnerability Triage UI
 */

import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import { InkApp } from './ui/InkApp.js';

const cli = meow(
  `
  Usage
    $ appscan-triage-ui [options]

  Options
    --config, -c  Path to configuration file
    --help        Show help

  Examples
    $ appscan-triage-ui
    $ appscan-triage-ui --config /path/to/.appscantriage.json
`,
  {
    importMeta: import.meta,
    flags: {
      config: {
        type: 'string',
        alias: 'c',
      },
    },
  }
);

render(<InkApp configPath={cli.flags.config} />);
