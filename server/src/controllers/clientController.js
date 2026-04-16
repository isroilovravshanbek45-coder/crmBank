import Client from '../models/Client.js';
import { validationResult } from 'express-validator';

// Barcha mijozlarni olish (Admin uchun)
export const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    console.error('Get all clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Mijozlarni yuklashda xatolik'
    });
  }
};

// Operator mijozlarini olish
export const getOperatorClients = async (req, res) => {
  try {
    const operatorId = req.user.operatorId;

    const clients = await Client.find({ operatorRaqam: operatorId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    console.error('Get operator clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Mijozlarni yuklashda xatolik'
    });
  }
};

// Bitta mijozni olish
export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Mijoz topilmadi'
      });
    }

    // Agar operator bo'lsa, faqat o'z mijozini ko'ra oladi
    if (req.user.role === 'operator' && client.operatorRaqam !== req.user.operatorId) {
      return res.status(403).json({
        success: false,
        message: 'Bu mijozni ko\'rish huquqi yo\'q'
      });
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Get client by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Mijozni yuklashda xatolik'
    });
  }
};

// Yangi mijoz qo'shish
export const createClient = async (req, res) => {
  try {
    // Validatsiya xatolarini tekshirish
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { ism, familya, telefon, hudud, garov, summa, status, comment } = req.body;

    // Operator faqat o'ziga mijoz qo'sha oladi
    const operatorRaqam = req.user.operatorId;

    const client = await Client.create({
      ism,
      familya,
      telefon,
      hudud,
      garov,
      summa,
      operatorRaqam,
      status: status || 'Jarayonda',
      comment: comment || ''
    });

    res.status(201).json({
      success: true,
      message: 'Mijoz muvaffaqiyatli qo\'shildi',
      data: client
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({
      success: false,
      message: 'Mijoz qo\'shishda xatolik'
    });
  }
};

// Mijozni yangilash
export const updateClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Mijoz topilmadi'
      });
    }

    // Operator faqat o'z mijozini tahrirlashi mumkin
    if (req.user.role === 'operator' && client.operatorRaqam !== req.user.operatorId) {
      return res.status(403).json({
        success: false,
        message: 'Bu mijozni tahrirlash huquqi yo\'q'
      });
    }

    const { ism, familya, telefon, hudud, garov, summa, status, comment } = req.body;

    // Yangilash
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      {
        ism,
        familya,
        telefon,
        hudud,
        garov,
        summa,
        status,
        comment
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Mijoz muvaffaqiyatli yangilandi',
      data: updatedClient
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({
      success: false,
      message: 'Mijozni yangilashda xatolik'
    });
  }
};

// Mijozni o'chirish (Admin uchun)
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Mijoz topilmadi'
      });
    }

    await Client.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Mijoz muvaffaqiyatli o\'chirildi'
    });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({
      success: false,
      message: 'Mijozni o\'chirishda xatolik'
    });
  }
};

// Statistika olish
export const getStatistics = async (req, res) => {
  try {
    const { operatorId, period } = req.query;

    let filter = {};

    // Agar operator bo'lsa, faqat o'z statistikasini ko'radi
    if (req.user.role === 'operator') {
      filter.operatorRaqam = req.user.operatorId;
    } else if (operatorId && operatorId !== 'all') {
      // Admin muayyan operator statistikasini ko'rmoqchi
      filter.operatorRaqam = operatorId;
    }

    // Vaqt filtri
    if (period) {
      const now = new Date();
      let startDate;

      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      if (startDate) {
        filter.createdAt = { $gte: startDate };
      }
    }

    const clients = await Client.find(filter);

    const stats = {
      totalClients: clients.length,
      totalAmount: clients.reduce((sum, client) => sum + client.summa, 0),
      approved: clients.filter(c => c.status === 'Tasdiqlangan').length,
      pending: clients.filter(c => c.status === 'Jarayonda').length,
      rejected: clients.filter(c => c.status === 'Rad etilgan').length
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Statistikani yuklashda xatolik'
    });
  }
};
