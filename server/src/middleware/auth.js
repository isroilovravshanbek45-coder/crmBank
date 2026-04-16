import jwt from 'jsonwebtoken';

// Operator autentifikatsiyasi
export const authenticateOperator = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token topilmadi. Iltimos tizimga kiring.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'operator') {
      return res.status(403).json({
        success: false,
        message: 'Ruxsat yo\'q. Faqat operatorlar uchun.'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token noto\'g\'ri yoki muddati o\'tgan.'
    });
  }
};

// Admin autentifikatsiyasi
export const authenticateAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token topilmadi. Iltimos tizimga kiring.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Ruxsat yo\'q. Faqat adminlar uchun.'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token noto\'g\'ri yoki muddati o\'tgan.'
    });
  }
};

// Operator yoki Admin (ikkalasi ham kirishi mumkin)
export const authenticateUser = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token topilmadi. Iltimos tizimga kiring.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token noto\'g\'ri yoki muddati o\'tgan.'
    });
  }
};
