// jest.setup.js
globalThis.importMetaEnv = {
  VITE_API_URL: "http://localhost:5000", // default or testing URL
};

// Mock import.meta.env
Object.defineProperty(global, "import", {
  value: {
    meta: {
      env: globalThis.importMetaEnv,
    },
  },
});
