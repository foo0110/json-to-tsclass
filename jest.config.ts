/* eslint-disable */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  coverageDirectory: "./coverage",
  roots: ["<rootDir>/src"],
  testMatch: ["<rootDir>/src/**/__tests__/**/*.[jt]s?(x)", "<rootDir>/src/**/*.(spec|test).[tj]s?(x)"],
};
