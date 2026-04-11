const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');
const Term = require('./src/models/Term');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ path: path.join(__dirname, '.env') });

const seedTerms = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, { family: 4 });
        console.log('Connected to MongoDB successfully!');

        await Term.deleteMany({});
        console.log('Cleaned up old terms.');

        const terms = [
            {
                code: 'HK1-2024',
                name: 'Học kỳ 1 Năm học 2024-2025',
                startDate: new Date('2024-09-01'),
                endDate: new Date('2025-01-15'),
                status: 'Active'
            },
            {
                code: 'HK2-2024',
                name: 'Học kỳ 2 Năm học 2024-2025',
                startDate: new Date('2025-02-15'),
                endDate: new Date('2025-06-30'),
                status: 'Upcoming'
            },
            {
                code: 'HK3-2024',
                name: 'Học kỳ phụ (Hè) Năm học 2024-2025',
                startDate: new Date('2025-07-01'),
                endDate: new Date('2025-08-31'),
                status: 'Upcoming'
            }
        ];

        for (const term of terms) {
             await Term.create(term);
             console.log(`- Term Created: ${term.code}`);
        }

        console.log('Terms seeded successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedTerms();
