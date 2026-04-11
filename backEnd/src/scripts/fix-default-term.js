const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Use Google Public DNS to resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const Term = require('../models/Term');

const checkAndFixDefaultTerm = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const defaultTerm = await Term.findOne({ isDefault: true });
    
    if (defaultTerm) {
      console.log(`Current default term: ${defaultTerm.name} (${defaultTerm.code})`);
    } else {
      console.log('No default term found. Looking for any term...');
      const anyTerm = await Term.findOne().sort({ code: -1 });
      
      if (anyTerm) {
        anyTerm.isDefault = true;
        await anyTerm.save();
        console.log(`Applied default status to: ${anyTerm.name} (${anyTerm.code})`);
      } else {
        console.log('No terms exist in the database. Creating a mock term...');
        await Term.create({
          code: '2023.2',
          name: 'Học kỳ 2 (2023-2024)',
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-06-15'),
          isDefault: true
        });
        console.log('Mock term 2023.2 created as default.');
      }
    }

    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkAndFixDefaultTerm();
