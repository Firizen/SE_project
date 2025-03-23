module.exports = {
  setupFilesAfterEnv: ["<rootDir>/tests/setupMongoMemory.js"],
  testEnvironment: "node",
  testTimeout: 20000, // Increase timeout
};
