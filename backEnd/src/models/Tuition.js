const mongoose = require('mongoose');

const tuitionSchema = new mongoose.Schema({
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
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Unpaid', 'Partial', 'Paid'],
    default: 'Unpaid'
  },
  deadline: {
    type: Date
  },
  details: [{
    description: String,
    amount: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('Tuition', tuitionSchema);
