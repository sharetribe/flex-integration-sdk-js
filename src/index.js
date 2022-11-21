import SharetribeSdk from './integration_sdk';
import * as types from './types';
import memoryStore from './memory_store';
import fileStore from './file_store';
import {
  objectQueryString,
  createRateLimiter,
  devQueryLimiterConfig,
  devCommandLimiterConfig,
  prodQueryLimiterConfig,
  prodCommandLimiterConfig,
} from './utils';

const createInstance = config => new SharetribeSdk(config);

// Export token stores
const tokenStore = {
  memoryStore,
  fileStore,
};

// Export util functions
const util = {
  objectQueryString,
  createRateLimiter,
  devQueryLimiterConfig,
  devCommandLimiterConfig,
  prodQueryLimiterConfig,
  prodCommandLimiterConfig,
};

/* eslint-disable import/prefer-default-export */
export { createInstance, types, tokenStore, util };
