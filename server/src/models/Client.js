import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  ism: {
    type: String,
    required: [true, 'Ism majburiy'],
    trim: true
  },
  familya: {
    type: String,
    required: [true, 'Familya majburiy'],
    trim: true
  },
  telefon: {
    type: String,
    required: [true, 'Telefon majburiy'],
    trim: true
  },
  hudud: {
    type: String,
    required: [true, 'Hudud majburiy'],
    trim: true
  },
  garov: {
    type: String,
    required: [true, 'Garov majburiy'],
    trim: true
  },
  summa: {
    type: Number,
    required: [true, 'Summa majburiy']
  },
  operatorRaqam: {
    type: String,
    required: [true, 'Operator raqami majburiy']
  },
  status: {
    type: String,
    enum: ['Jarayonda', 'Tasdiqlangan', 'Rad etilgan'],
    default: 'Jarayonda'
  },
  comment: {
    type: String,
    default: ''
  }
}, {
  timestamps: true // createdAt va updatedAt avtomatik qo'shiladi
});

// Index qo'shish - tez qidiruv uchun
clientSchema.index({ operatorRaqam: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ createdAt: -1 });

const Client = mongoose.model('Client', clientSchema);

export default Client;
