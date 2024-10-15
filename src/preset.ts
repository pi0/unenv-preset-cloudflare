import type { Preset } from "unenv";

// Built-in APIs provided by workerd.
// https://developers.cloudflare.com/workers/runtime-apis/nodejs/
// https://github.com/cloudflare/workerd/tree/main/src/node
// Last checked: 2024-05-11
const cloudflareNodeCompatModules = [
  "_stream_duplex",
  "_stream_passthrough",
  "_stream_readable",
  "_stream_transform",
  "_stream_writable",
  "assert",
  "diagnostics_channel",
  "events",
  "path",
  "stream",
  "stream/consumers",
  "stream/promises",
  "stream/web",
  "string_decoder",
  "zlib",
];

// Modules implemented via a mix of workerd APIs and polyfills.
// See `src/runtime/node/<module name>/$cloudflare.ts`.
const hybridNodeCompatModules = [
  "async_hooks",
  "console",
  "buffer",
  "crypto",
  "perf_hooks",
  "module",
  "process",
  "timers",
  "util",
  "util/types",
];

export const cloudflare: Preset = {
  alias: {
    ...Object.fromEntries(
      cloudflareNodeCompatModules.flatMap((p) => [
        [p, p],
        [`node:${p}`, `node:${p}`],
      ]),
    ),
    // The `node:assert` implementation of workerd uses strict semantics by default
    "assert/strict": "node:assert",
    "node:assert/strict": "node:assert",
    // The `node:sys` module is just a deprecated alias for `node:util` which we implemented using a hybrid polyfill
    sys: "unenv-preset-cloudflare/runtime/node/util/$cloudflare",
    "node:sys": "unenv-preset-cloudflare/runtime/node/util/$cloudflare",

    // define aliases for hybrid modules
    ...Object.fromEntries(
      hybridNodeCompatModules.flatMap((m) => [
        [m, `unenv-preset-cloudflare/runtime/node/${m}/$cloudflare`],
        [`node:${m}`, `unenv-preset-cloudflare/runtime/node/${m}/$cloudflare`],
      ]),
    ),
  },
  inject: {
    // workerd already defines `global` and `Buffer`
    // override the previous presets so that we use the native implementation
    Buffer: false,
    global: false,
    console: "unenv-preset-cloudflare/runtime/node/console/$cloudflare",
    process: "unenv-preset-cloudflare/runtime/node/process/$cloudflare",
    setImmediate: [
      "unenv-preset-cloudflare/runtime/node/timers/$cloudflare",
      "setImmediate",
    ],
    clearImmediate: [
      "unenv-preset-cloudflare/runtime/node/timers/$cloudflare",
      "clearImmediate",
    ],
    performance: ["perf_hooks", "performance"],
    Performance: ["perf_hooks", "Performance"],
    PerformanceEntry: ["perf_hooks", "PerformanceEntry"],
    PerformanceMark: ["perf_hooks", "PerformanceMark"],
    PerformanceMeasure: ["perf_hooks", "PerformanceMeasure"],
    PerformanceObserver: ["perf_hooks", "PerformanceObserver"],
    PerformanceObserverEntryList: [
      "perf_hooks",
      "PerformanceObserverEntryList",
    ],
    PerformanceResourceTiming: ["perf_hooks", "PerformanceResourceTiming"],
  },
  polyfill: [],
  external: cloudflareNodeCompatModules.flatMap((p) => [p, `node:${p}`]),
};
