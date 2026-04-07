const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backEnd/.env') });

const UserSchema = new mongoose.Schema({ email: String });
const User = mongoose.model('User', UserSchema);

async function findOne() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne();
        if (user) {
            console.log('TEST_EMAIL=' + user.email);
        } else {
            console.log('NO_USER_FOUND');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findOne();
