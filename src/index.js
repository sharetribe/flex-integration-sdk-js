import SharetribeSdk from './sdk';
import * as types from './types';
import memoryStore from './memory_store';

const createInstance = config => new SharetribeSdk(config);

// Export token stores
const tokenStore = {
  memoryStore,
};

/* eslint-disable import/prefer-default-export */
export { createInstance, types, tokenStore };
