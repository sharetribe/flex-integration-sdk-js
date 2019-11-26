import memoryStore from './memory_store';

/* eslint-disable import/prefer-default-export */

// Default to in-memory store.
export const createDefaultTokenStore = () => memoryStore();
