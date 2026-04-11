const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const College = require('../src/models/College');
const Faculty = require('../src/models/Faculty');
const Major = require('../src/models/Major');

const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // 1. DELETE EXISTING ACADEMIC DATA
        await College.deleteMany({});
        await Faculty.deleteMany({});
        await Major.deleteMany({});
        console.log('Old academic data destroyed.');

        // 2. READ JSON FILES
        const rootDir = path.join(__dirname, '..', '..');
        const files = ['CTD.json', 'COB.json', 'CELG.json'];
        
        for (const file of files) {
            const filePath = path.join(rootDir, file);
            if (fs.existsSync(filePath)) {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                const collegeData = data.college;
                
                // Create College
                const newCollege = await College.create({
                    code: collegeData.id,
                    name: collegeData.name,
                    description: collegeData.english_name || '',
                    status: 'Active'
                });
                
                console.log(`Created College: ${newCollege.name}`);

                // Create Faculties for this College
                if (collegeData.departments && collegeData.departments.length > 0) {
                    for (const deptData of collegeData.departments) {
                        const newFaculty = await Faculty.create({
                            code: deptData.id,
                            name: deptData.name,
                            type: deptData.type || 'Khoa', // Default to Khoa if not specified
                            college: newCollege._id,
                            status: 'Active'
                        });
                        
                        console.log(`  - Created Faculty: ${newFaculty.name}`);

                        // Create Majors (Units) for this Faculty
                        if (deptData.units && deptData.units.length > 0) {
                            for (const unitData of deptData.units) {
                                await Major.create({
                                    code: unitData.id,
                                    name: unitData.name,
                                    faculty: newFaculty._id,
                                    status: 'Active'
                                });
                            }
                            console.log(`    + Created ${deptData.units.length} Majors for ${newFaculty.name}`);
                        }
                    }
                }
            } else {
                console.log(`File not found: ${filePath}`);
            }
        }

        console.log('Data Import Success!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
}

importData();
