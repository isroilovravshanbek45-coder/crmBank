import mongoose from 'mongoose';

const operatorSchema = new mongoose.Schema({
  operatorId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

const Operator = mongoose.model('Operator', operatorSchema);

export default Operator;
