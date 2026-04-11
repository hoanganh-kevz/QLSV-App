const mongoose = require('mongoose');

const examScheduleSchema = new mongoose.Schema({
  classSection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassSection',
    required: true
  },
  examDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, // HH:mm
    required: true
  },
  duration: {
    type: Number, // Minutes
    required: true
  },
  room: {
    type: String,
    required: true
  },
  examType: {
    type: String,
    enum: ['Midterm', 'Final', 'Quiz'],
    default: 'Final'
  },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('ExamSchedule', examScheduleSchema);
