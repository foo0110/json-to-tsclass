/* eslint-disable */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  coverageDirectory: "./coverage",
  // run tests located under any __tests__ folder but ignore tmp and node_modules
  testMatch: ["<rootDir>/**/__tests__/**/*.[jt]s?(x)", "<rootDir>/**/*.(spec|test).[tj]s?(x)"],
  testPathIgnorePatterns: ["<rootDir>/tmp/", "<rootDir>/node_modules/"],
};
