const mongoose = require('mongoose');

const teacherEvaluationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  classSection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassSection',
    required: true
  },
  ratings: {
    professionalism: { type: Number, min: 1, max: 5 },
    content: { type: Number, min: 1, max: 5 },
    support: { type: Number, min: 1, max: 5 },
    fairness: { type: Number, min: 1, max: 5 }
  },
  comment: {
    type: String,
    trim: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('TeacherEvaluation', teacherEvaluationSchema);
