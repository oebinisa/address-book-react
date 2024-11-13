// jest.config.cjs
const path = require("path");

module.exports = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(css|scss|sass)$": "identity-obj-proxy",
  },
  setupFilesAfterEnv: ["@testing-library/jest-dom", "<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.[jt]sx?$": [
      "babel-jest",
      { configFile: path.resolve(__dirname, "babel.config.cjs") },
    ],
  },
  transformIgnorePatterns: [
    "<rootDir>/node_modules/",
    "/node_modules/(?!@testing-library/react|some-other-modules-to-transform)",
  ],
};
