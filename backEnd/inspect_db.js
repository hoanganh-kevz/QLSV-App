const mongoose = require("mongoose");
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require("dotenv").config({ path: "c:/Users/ADMIN/OneDrive/Máy tính/CNPM_CUOI_KY/backEnd/.env" });

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = require('./src/models/User.js');
        const Student = require('./src/models/Student.js');

        const students = await Student.find({});
        console.log("Students count:", students.length);

        const users = await User.find({ role: 'student' });
        console.log("Student users count:", users.length);
        
        const invalidUsers = [];
        for (const u of users) {
            const hasStudent = await Student.findOne({ userId: u._id });
            if (!hasStudent) {
                invalidUsers.push(u);
            }
        }
        console.log("Invalid users without student profile:", invalidUsers.length);
        
        if (invalidUsers.length > 0) {
            console.log("Trying to delete one invalid user...");
            try {
                await invalidUsers[0].deleteOne();
                console.log("Success deleting invalid user");
            } catch (err) {
                console.error("Error deleting:", err);
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}
run();
