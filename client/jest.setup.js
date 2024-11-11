// jest.setup.js
globalThis.importMeta = { env: { VITE_API_URL: 'http://localhost' } };

// Mock import.meta.env
Object.defineProperty(global, "import", {
  value: {
    meta: {
      env: globalThis.importMetaEnv,
    },
  },
});
