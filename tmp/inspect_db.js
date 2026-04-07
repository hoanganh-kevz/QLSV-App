const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backEnd/.env') });

const Grade = require('../backEnd/src/models/Grade');
const Subject = require('../backEnd/src/models/Subject');

async function inspect() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const subjects = await Subject.find({});
        console.log('SUBJECTS:');
        console.log(JSON.stringify(subjects, null, 2));

        const grades = await Grade.find({});
        console.log('GRADES:');
        console.log(JSON.stringify(grades, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspect();
