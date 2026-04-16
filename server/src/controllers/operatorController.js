import Operator from '../models/Operator.js';
import Client from '../models/Client.js';

// Barcha operatorlarni olish
export const getAllOperators = async (req, res) => {
  try {
    let operators = await Operator.find().sort({ operatorId: 1 });

    // Agar operators bo'sh bo'lsa, default operatorlarni yaratish
    if (operators.length === 0) {
      const defaultOperators = [];
      for (let i = 401; i <= 410; i++) {
        defaultOperators.push({
          operatorId: i.toString(),
          name: `Operator ${i}`,
          status: 'active'
        });
      }
      operators = await Operator.insertMany(defaultOperators);
    }

    // Har bir operator uchun mijozlar sonini hisoblash
    const operatorsWithStats = await Promise.all(
      operators.map(async (operator) => {
        const clients = await Client.find({ operatorRaqam: operator.operatorId });

        return {
          id: operator.operatorId,
          name: operator.name,
          status: operator.status,
          clientCount: clients.length,
          stats: {
            total: clients.length,
            approved: clients.filter(c => c.status === 'Tasdiqlangan').length,
            pending: clients.filter(c => c.status === 'Jarayonda').length,
            rejected: clients.filter(c => c.status === 'Rad etilgan').length,
            totalAmount: clients.reduce((sum, c) => sum + c.summa, 0)
          }
        };
      })
    );

    res.json({
      success: true,
      count: operatorsWithStats.length,
      data: operatorsWithStats
    });
  } catch (error) {
    console.error('Get all operators error:', error);
    res.status(500).json({
      success: false,
      message: 'Operatorlarni yuklashda xatolik'
    });
  }
};

// Bitta operatorni olish
export const getOperatorById = async (req, res) => {
  try {
    const operatorId = req.params.id;

    let operator = await Operator.findOne({ operatorId });

    // Agar operator topilmasa, yaratish
    if (!operator) {
      operator = await Operator.create({
        operatorId,
        name: `Operator ${operatorId}`,
        status: 'active'
      });
    }

    // Operator mijozlarini olish
    const clients = await Client.find({ operatorRaqam: operatorId }).sort({ createdAt: -1 });

    const stats = {
      total: clients.length,
      approved: clients.filter(c => c.status === 'Tasdiqlangan').length,
      pending: clients.filter(c => c.status === 'Jarayonda').length,
      rejected: clients.filter(c => c.status === 'Rad etilgan').length,
      totalAmount: clients.reduce((sum, c) => sum + c.summa, 0)
    };

    res.json({
      success: true,
      data: {
        operator: {
          id: operator.operatorId,
          name: operator.name,
          status: operator.status
        },
        stats,
        clients
      }
    });
  } catch (error) {
    console.error('Get operator by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Operatorni yuklashda xatolik'
    });
  }
};

// Operatorni yangilash
export const updateOperator = async (req, res) => {
  try {
    const operatorId = req.params.id;
    const { name, status } = req.body;

    let operator = await Operator.findOne({ operatorId });

    if (!operator) {
      return res.status(404).json({
        success: false,
        message: 'Operator topilmadi'
      });
    }

    operator.name = name || operator.name;
    operator.status = status || operator.status;

    await operator.save();

    res.json({
      success: true,
      message: 'Operator muvaffaqiyatli yangilandi',
      data: operator
    });
  } catch (error) {
    console.error('Update operator error:', error);
    res.status(500).json({
      success: false,
      message: 'Operatorni yangilashda xatolik'
    });
  }
};

// Top operatorlarni olish
export const getTopOperators = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const operators = await Operator.find().sort({ operatorId: 1 });

    // Har bir operator uchun statistika
    const operatorsWithStats = await Promise.all(
      operators.map(async (operator) => {
        const clients = await Client.find({ operatorRaqam: operator.operatorId });

        return {
          id: operator.operatorId,
          name: operator.name,
          status: operator.status,
          stats: {
            total: clients.length,
            approved: clients.filter(c => c.status === 'Tasdiqlangan').length,
            pending: clients.filter(c => c.status === 'Jarayonda').length,
            rejected: clients.filter(c => c.status === 'Rad etilgan').length,
            totalAmount: clients.reduce((sum, c) => sum + c.summa, 0)
          }
        };
      })
    );

    // Tasdiqlangan mijozlar soni bo'yicha saralash
    operatorsWithStats.sort((a, b) => {
      if (b.stats.approved !== a.stats.approved) {
        return b.stats.approved - a.stats.approved;
      }
      if (b.stats.total !== a.stats.total) {
        return b.stats.total - a.stats.total;
      }
      if (b.stats.totalAmount !== a.stats.totalAmount) {
        return b.stats.totalAmount - a.stats.totalAmount;
      }
      return parseInt(a.id) - parseInt(b.id);
    });

    res.json({
      success: true,
      data: operatorsWithStats.slice(0, limit)
    });
  } catch (error) {
    console.error('Get top operators error:', error);
    res.status(500).json({
      success: false,
      message: 'Top operatorlarni yuklashda xatolik'
    });
  }
};
