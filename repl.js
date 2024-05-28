/* eslint-env node */
/* eslint-disable no-console */

// Don't show an error when devDependencies (i.e. colors) is imported
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

const colors = require('colors');
const repl = require('repl');
const sharetribeIntegrationSdk = require('./src/index');

// Start REPL
const replInstance = repl.start('> ');

// Assign SDK as global
const ctx = replInstance.context;
ctx.sharetribeIntegrationSdk = sharetribeIntegrationSdk;

// Welcome message

colors.setTheme({
  h1: 'yellow',
  h2: 'yellow',
  inline: 'gray',
  block: 'gray',
});

console.log('');
console.log('');
console.log('  # REPL'.h1);
console.log('  ');
console.log('  With the REPL you can test and try out the SDK with real results from the API.');
console.log('  ');
console.log('  To start the REPL, type:');
console.log('  ');
console.log('  ```'.block);
console.log('  > yarn run repl'.block);
console.log('  ```'.block);
console.log('  ');
console.log('  ## Globals'.h2);
console.log('  ');
console.log('  The following globals are available:');
console.log('  ');
console.log(`  - ${'`sharetribeIntegrationSdk`'.inline}: The SDK module`);
console.log('  ');
console.log('  ## Example usage'.h2);
console.log('  ');
console.log('  Create new SDK instance:');
console.log('  ');
console.log('  ```'.block);
console.log('  const clientId = "<your client ID here>";'.block);
console.log('  const clientSecret = "<your client secret here>";'.block);
console.log('  const integrationSdk = sharetribeIntegrationSdk.createInstance({'.block);
console.log('    clientId,'.block);
console.log('    clientSecret,'.block);
console.log('    tokenStore: sharetribeIntegrationSdk.tokenStore.memoryStore()'.block);
console.log('  });'.block);
console.log('  ```'.block);
console.log('  ');
console.log('  Fetch 10 listings:');
console.log('  ');
console.log('  ```'.block);
console.log('  integrationSdk.listings.query({per_page: 10}).then(response => {'.block);
console.log('    console.log("Fetched " + response.data.data.length + " listings.");'.block);
console.log('    response.data.data.forEach(listing => {'.block);
console.log('      console.log(listing.attributes.title);'.block);
console.log('    });'.block);
console.log('  });'.block);
console.log('  ```'.block);
console.log('  ');
console.log(`  Type ${'`.exit`'.inline} when you want to exit the REPL`);
console.log('  ');
console.log('  Hit [Enter] when you\'re ready to start!');
