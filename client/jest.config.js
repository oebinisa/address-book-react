// jest.config.js
module.exports = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(css|scss|sass)$": "identity-obj-proxy",
  },
  setupFilesAfterEnv: ["@testing-library/jest-dom", "<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.[jt]sx?$": ["babel-jest", { configFile: "./babel-jest.config.js" }],
  },
  transformIgnorePatterns: [
    "<rootDir>/node_modules/",
    "/node_modules/(?!@testing-library/react|some-other-modules-to-transform)",
  ],
};
