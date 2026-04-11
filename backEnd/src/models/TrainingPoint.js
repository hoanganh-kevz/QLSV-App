const mongoose = require('mongoose');

const trainingPointSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  term: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Term',
    required: true
  },
  criteria: [{
    category: {
      type: String,
      required: true
    },
    maxPoints: Number,
    points: {
      type: Number,
      default: 0
    }
  }],
  totalPoints: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 100
  },
  classification: {
    type: String,
    enum: ['Xuất sắc', 'Tốt', 'Khá', 'Trung bình', 'Yếu', 'Kém'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('TrainingPoint', trainingPointSchema);
