const os = require('os');
const fs = require('fs');
const path = require('path');
const xdgBasedir = require('xdg-basedir');
const envPaths = require('env-paths');

const ERROR_CODE_NOT_FOUND = 'ENOENT';
const dirname = 'flex-integration-sdk';

// In theory this is incorrect. XDG should only be used for Linux,
// not for Mac OS. However, many common tools store config files
// to ~/.config according to the XDG spec.
//
// This is also what Sharetribe CLI does, so for consistency we'll also
// use the XDG base dir here.
const configDir =
  os.platform() === 'darwin' ? path.join(xdgBasedir.config, dirname) : envPaths(dirname).config;

const tokenFilePath = path.join(configDir, 'file-store-token.json');

const createConfigDir = () => fs.promises.mkdir(configDir, { recursive: true, mode: 0o700 });

const getToken = () =>
  fs.promises
    .readFile(tokenFilePath)
    .then(contents => JSON.parse(contents))
    .catch(e => {
      if (e.code === ERROR_CODE_NOT_FOUND) {
        // File does not exist i.e. token not found
        return Promise.resolve(null);
      }
      throw e;
    });

const setToken = token => {
  const writeToken = () =>
    fs.promises.writeFile(tokenFilePath, JSON.stringify(token), { mode: 0o600 });

  return writeToken().catch(e => {
    if (e.code === ERROR_CODE_NOT_FOUND) {
      // Config dir not found, let's create it first and retry writing.
      return createConfigDir().then(writeToken);
    }
    throw e;
  });
};

const removeToken = () =>
  // Remove the whole token file
  fs.promises.unlink(tokenFilePath).catch(e => {
    if (e.code === ERROR_CODE_NOT_FOUND) {
      // File does not exist, ignore error
      return Promise.resolve(null);
    }
    throw e;
  });
const createStore = () => ({ getToken, setToken, removeToken });

export default createStore;
