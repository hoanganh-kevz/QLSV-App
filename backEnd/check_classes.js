const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:/Users/ADMIN/OneDrive/Máy tính/CNPM_CUOI_KY/backEnd/.env' });

async function verify() {
    await mongoose.connect(process.env.MONGO_URI);
    
    const College = require('./src/models/College.js');
    const Faculty = require('./src/models/Faculty.js');
    const Major = require('./src/models/Major.js');
    const Class = require('./src/models/Class.js');

    const classes = await Class.find({ status: 'Active' })
        .populate({ path: 'major', populate: { path: 'faculty', populate: { path: 'college' } } });

    let ok = 0, broken = 0;
    for (const cls of classes) {
        if (cls.major?.faculty?.college?.name) {
            ok++;
            console.log(`  OK: ${cls.code} -> major:${cls.major.name} -> faculty:${cls.major.faculty.name} -> college:${cls.major.faculty.college.name}`);
        } else {
            broken++;
            console.warn(`  BROKEN: ${cls.code} -> major: ${cls.major?._id}`);
        }
    }
    console.log(`\nResult: ${ok} OK, ${broken} BROKEN`);
    
    mongoose.disconnect();
}

verify().catch(console.error);
