const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Force Google DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGO_URI;
console.log('Testing connection to:', uri.replace(/:([^@]+)@/, ':****@'));

async function testConnection() {
    console.log('--- Step 1: DNS Lookup ---');
    try {
        const host = 'cluster0.xfbfoia.mongodb.net';
        console.log(`Resolving SRV for ${host}...`);
        const srv = await dns.promises.resolveSrv(`_mongodb._tcp.${host}`);
        console.log('SRV Records found:', srv);
        
        for (const record of srv) {
            try {
                const addrs = await dns.promises.resolve4(record.name);
                console.log(`Resolved node ${record.name} to ${addrs.join(', ')}`);
            } catch (e) {
                console.error(`Failed to resolve node ${record.name}: ${e.message}`);
            }
        }
    } catch (err) {
        console.error('DNS SRV resolution failed:', err.message);
    }

    console.log('\n--- Step 2: Mongoose Connection ---');
    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            family: 4
        });
        console.log('SUCCESS: Connection established!');
        process.exit(0);
    } catch (err) {
        console.error('FAILURE: Could not connect.');
        console.error('Error Details:', err.name, '-', err.message);
        process.exit(1);
    }
}

testConnection();
