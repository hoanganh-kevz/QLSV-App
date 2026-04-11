const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:/Users/ADMIN/OneDrive/Máy tính/CNPM_CUOI_KY/backEnd/.env' });

// Mapping: old class codes to new major IDs (based on best match of purpose)
// Classes have prefix pattern. Map class code prefix to the correct new major ObjectId
const classMajorMapping = {
    // KDQT (Kinh doanh quốc tế) -> IBM_01 Kinh doanh quốc tế
    'KDQT': '69ce0e52224bf475cc567a9a',
    // MKT (Marketing) -> IBM_03 Marketing
    'MKT': '69ce0e52224bf475cc567a9e',
    // QTKD (Quản trị kinh doanh) -> SOM_01 Quản trị kinh doanh
    'QTKD': '69ce0e51224bf475cc567a8c',
    // KT_BUS (Kế toán) -> SOA_02 Kế toán doanh nghiệp
    'KT_BUS': '69ce0e53224bf475cc567aba',
    // SE (Software Engineering / Kỹ thuật phần mềm) -> BIT_07
    'SE': '69ce0e50224bf475cc567a66',
    // MIS (Management Information Systems) -> BIT_01 Hệ thống thông tin kinh doanh
    'MIS': '69ce0e50224bf475cc567a5c',
    // TKD (Thương mại điện tử) -> BIT_08 Thương mại điện tử
    'TKD': '69ce0e50224bf475cc567a68',
};

function getNewMajorId(classCode) {
    for (const [prefix, majorId] of Object.entries(classMajorMapping)) {
        if (classCode.startsWith(prefix)) {
            return majorId;
        }
    }
    return null;
}

async function migrate() {
    await mongoose.connect(process.env.MONGO_URI);
    
    const classes = await mongoose.connection.collection('classes').find({}).toArray();
    console.log(`Found ${classes.length} classes to migrate.`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const cls of classes) {
        const newMajorId = getNewMajorId(cls.code);
        if (newMajorId) {
            await mongoose.connection.collection('classes').updateOne(
                { _id: cls._id },
                { $set: { major: new mongoose.Types.ObjectId(newMajorId) } }
            );
            console.log(`  Updated: ${cls.code} -> majorId ${newMajorId}`);
            updated++;
        } else {
            console.warn(`  SKIPPED (no mapping): ${cls.code}`);
            skipped++;
        }
    }
    
    console.log(`\nMigration done: ${updated} updated, ${skipped} skipped.`);
    mongoose.disconnect();
}

migrate().catch(console.error);
