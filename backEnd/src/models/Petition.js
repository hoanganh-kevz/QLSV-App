const mongoose = require('mongoose');

const petitionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  classSection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassSection'
  },
  absenceDate: {
    type: Date
  },
  type: {
    type: String,
    enum: ['Academic', 'Financial', 'Activity', 'GradeReview', 'Absence', 'Other'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  response: {
    type: String,
    trim: true
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  attachmentUrl: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Petition', petitionSchema);
