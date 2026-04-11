const mongoose = require('mongoose');

const classSectionSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Class section code is required'],
        unique: true,
        trim: true,
        uppercase: true // e.g., 26D2INF50901005
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: [true, 'Subject reference is required']
    },
    term: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Term',
        required: [true, 'Term reference is required']
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher' // Optional
    },
    maxStudents: {
        type: Number,
        required: [true, 'Maximum student count is required'],
        min: 1,
        default: 40
    },
    status: {
        type: String,
        enum: ['Upcoming', 'Active', 'Completed', 'Cancelled'],
        default: 'Active'
    },
    targetClasses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }],
    enrolledStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    schedule: [{
        dayOfWeek: {
            type: Number,
            required: [true, 'Day of week is required'],
            min: 2, // Monday
            max: 8  // Sunday
        },
        startPeriod: {
            type: Number,
            required: [true, 'Start period is required'],
            min: 1,
            max: 18
        },
        endPeriod: {
            type: Number,
            required: [true, 'End period is required'],
            min: 1,
            max: 18
        },
        room: {
            type: String,
            trim: true,
            default: 'TBA'
        }
    }],
    // Đợt học: phần nào của học kỳ (Đợt 1: nửa đầu, Đợt 2: nửa sau, Cả kỳ: toàn bộ)
    phase: {
        type: Number,
        enum: [1, 2, 0], // 1 = Đợt 1, 2 = Đợt 2, 0 = Cả học kỳ
        default: 0
    },
    // Hình thức học
    teachingMethod: {
        type: String,
        enum: ['Tập trung', 'Trực tuyến', 'Kết hợp'],
        default: 'Tập trung'
    },
    // Ngôn ngữ giảng dạy
    language: {
        type: String,
        enum: ['Tiếng Việt', 'Tiếng Anh', 'Tiếng Nhật', 'Tiếng Pháp', 'Khác'],
        default: 'Tiếng Việt'
    },
    // Ngoại lệ lịch học theo tuần (giảng viên tùy chỉnh)
    weeklyOverrides: [{
        week: { type: Number, required: true },           // Số tuần (1-20)
        termId: { type: mongoose.Schema.Types.ObjectId, ref: 'Term' },
        overrideType: {
            type: String,
            enum: ['reschedule', 'online', 'cancelled', 'custom'],
            required: true
        },
        schedule: [{
            dayOfWeek: { type: Number, min: 2, max: 8 },
            startPeriod: { type: Number, min: 1, max: 18 },
            endPeriod: { type: Number, min: 1, max: 18 },
            room: { type: String, trim: true }
        }],
        teachingMethod: {
            type: String,
            enum: ['Tập trung', 'Trực tuyến', 'Kết hợp']
        },
        room: { type: String, trim: true },
        note: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now }
    }],
    gradingSchema: [{
        name: { type: String, required: true },
        weight: { type: Number, required: true, min: 0, max: 100 },
        type: { type: String, enum: ['attendance', 'midterm', 'final', 'custom'], required: true },
        order: { type: Number, default: 0 }
    }],
    attendanceRules: {
        latePenalty: { type: Number, enum: [0, 0.5, 1], default: 0 }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ClassSection', classSectionSchema);
