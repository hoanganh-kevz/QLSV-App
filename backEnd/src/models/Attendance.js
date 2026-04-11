const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student reference is required']
  },
  classSection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassSection',
    required: [true, 'Class section reference is required']
  },
  date: {
    type: Date,
    required: [true, 'Attendance date is required'],
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late'],
    required: [true, 'Attendance status is required'],
    default: 'Present'
  },
  note: {
    type: String,
    trim: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Ensure a student is only marked once per class section per day
attendanceSchema.index({ student: 1, classSection: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
