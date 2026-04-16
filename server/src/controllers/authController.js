import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Operator login
export const operatorLogin = async (req, res) => {
  try {
    const { login, password } = req.body;

    // Validatsiya
    if (!login || !password) {
      return res.status(400).json({
        success: false,
        message: 'Login va parol majburiy'
      });
    }

    // Operator raqamlarini tekshirish
    const validOperators = ['401', '402', '403', '404', '405', '406', '407', '408', '409', '410'];
    const correctPassword = '1234';

    if (!validOperators.includes(login) || password !== correctPassword) {
      return res.status(401).json({
        success: false,
        message: 'Login yoki parol xato!'
      });
    }

    // JWT token yaratish
    const token = jwt.sign(
      {
        operatorId: login,
        role: 'operator'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // 7 kun amal qiladi
    );

    res.json({
      success: true,
      message: 'Muvaffaqiyatli kirildi',
      token,
      user: {
        operatorId: login,
        role: 'operator'
      }
    });
  } catch (error) {
    console.error('Operator login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Admin login
export const adminLogin = async (req, res) => {
  try {
    const { login, password } = req.body;

    // Validatsiya
    if (!login || !password) {
      return res.status(400).json({
        success: false,
        message: 'Login va parol majburiy'
      });
    }

    // Admin credentials ni .env dan olish
    const adminUsername = process.env.ADMIN_USERNAME || 'Nodir';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Ipoteka';

    if (login !== adminUsername || password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: 'Login yoki parol xato!'
      });
    }

    // JWT token yaratish
    const token = jwt.sign(
      {
        username: login,
        role: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Admin muvaffaqiyatli kirildi',
      token,
      user: {
        username: login,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Token tekshirish
export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token topilmadi'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json({
      success: true,
      user: decoded
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token noto\'g\'ri yoki muddati o\'tgan'
    });
  }
};
