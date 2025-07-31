#!/usr/bin/env node

/**
 * Helper script to find your machine's IP address for mobile device testing
 * Run with: node scripts/find-ip.js
 */

const os = require('os');

function findLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip internal (i.e. 127.0.0.1) and non-IPv4 addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        addresses.push({
          name,
          address: interface.address,
          url: `http://${interface.address}:3002`
        });
      }
    }
  }
  
  return addresses;
}

const addresses = findLocalIpAddress();

console.log('\n🔍 Found these IP addresses for your machine:\n');

if (addresses.length === 0) {
  console.log('❌ No external IP addresses found. Are you connected to a network?');
} else {
  addresses.forEach((addr, index) => {
    console.log(`${index + 1}. ${addr.name}: ${addr.address}`);
    console.log(`   Backend URL: ${addr.url}`);
    console.log(`   Static URL: ${addr.url}/static`);
    console.log('');
  });
  
  const primaryAddress = addresses[0];
  console.log('📝 To use with mobile device testing:');
  console.log(`\n1. Update native/config/environment.ts`);
  console.log(`2. Change the deviceTesting.backendHost to: "${primaryAddress.url}"`);
  console.log(`3. Switch the config to use: DEVELOPMENT_CONFIGS.deviceTesting`);
  console.log(`4. Make sure your backend is running on port 3002`);
  console.log(`5. Make sure your mobile device is on the same network\n`);
}