module.exports={
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 30000,
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  moduleFileExtensions: ["ts", "js", "json", "node"],
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
  verbose: true,
};