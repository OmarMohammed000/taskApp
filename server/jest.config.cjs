module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testTimeout: 30000,
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { useESM: true }],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  moduleFileExtensions: ["ts", "js", "json", "node"],
  testMatch: [
    "**/__tests__/**/*.test.[jt]s?(x)",
    "**/?(*.)+(spec|test).[tj]s?(x)",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  verbose: true,
};
