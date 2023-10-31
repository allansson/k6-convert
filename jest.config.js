/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  transformIgnorePatterns: ["/node_modules/(?!(prettier-src))/"],
  moduleNameMapper: {
    "~/(.*)": "<rootDir>/$1",
  },
  roots: ["<rootDir>"],
  modulePaths: ["<rootDir>"],
};
