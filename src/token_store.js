import memoryStore from './memory_store';

/* eslint-disable import/prefer-default-export */

export const createDefaultTokenStore = () => {

  // Default to in-memory store.
  return memoryStore();
};
