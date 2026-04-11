const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');
const User = require('./src/models/User');

// Force Google DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI;

const seedAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected successfully.');

        // Check if admin already exists
        const adminExists = await User.findOne({ username: process.env.ADMIN_USERNAME || 'admin' });

        if (adminExists) {
            console.log('Admin user already exists. Checking role...');
            if (adminExists.role !== 'admin') {
                adminExists.role = 'admin';
                await adminExists.save();
                console.log('Updated existing "admin" user to have "admin" role.');
            } else {
                console.log('Admin user is already correctly configured.');
            }
        } else {
            console.log('Creating initial admin user...');
            await User.create({
                username: process.env.ADMIN_USERNAME || 'admin',
                email: 'admin@ueh.edu.vn',
                password: process.env.ADMIN_PASSWORD || 'adminPassword123!', 
                name: 'System Administrator',
                role: 'admin'
            });
            console.log('Admin user created successfully!');
            console.log('Username:', process.env.ADMIN_USERNAME || 'admin');
        }

        console.log('Seeding completed. Closing connection...');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();
