const { User } = require('../models');
const { Token } = require('../models');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../utils/sendEmail');
const { v4: uuidv4 } = require('uuid');
const { generateToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');
const compressImage = require('../utils/imageCompressor');
const fs = require('fs')
const { Op } = require('sequelize');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('req => ', req.file)

    let compressedFilename = null;

    if (req.file) {
      compressedFilename = await compressImage(req.file.path, 'profile');
    }

    console.log('file name after compress ', compressedFilename)

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      isVerified: false,
      profileImage: compressedFilename
    });

    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.warn('Delete failed:', err.message);
        } else {
          console.log('Temp image deleted.');
        }
      });
    }

    const tokenValue = uuidv4();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await Token.create({
      userId: newUser.id,
      token: tokenValue,
      type: 'verifyEmail',
      expiresAt
    });

    const verificationUrl = `http://localhost:4000/api/auth/verify-email?token=${tokenValue}`;

    await sendEmail({
      to: newUser.email,
      subject: 'Verify your email',
      html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; text-align: center;">
        <h2 style="color: #333;">Welcome to Narayan's Assignment 👨‍💻</h2>
        <p style="color: #555; font-size: 15px;">
          Thank you for signing up! Please click the button below to verify your email address.
        </p>
        <a href="${verificationUrl}" 
           style="display: inline-block; margin-top: 20px; padding: 12px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
           Verify Email
        </a>
        <p style="color: #555; font-size: 14px; margin-top: 25px;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="word-break: break-all; font-size: 13px; color: #007bff;">
          ${verificationUrl}
        </p>
        <p style="color: #999; font-size: 13px; margin-top: 20px;">
          This verification link will expire in <strong>1 hour</strong>.
        </p>
        <p style="color: #bbb; font-size: 12px; margin-top: 30px;">
          If you didn’t request this, you can safely ignore this email.
        </p>
      </div>
    </div>
  `
    });

    res.status(201).json({
      message: 'User registered successfully. Please verify your email.',
      userId: newUser.id
    });

  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.warn('Delete failed:', err.message);
        } else {
          console.log('Temp image deleted.');
        }
      });
    }

    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed. Please try again later.' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const existingToken = await Token.findOne({
      where: {
        token,
        type: 'verifyEmail'
      }
    });

    if (!existingToken) {
      // return res.status(400).json({ message: 'Invalid or expired token.' });
      return res.redirect(`http://localhost:5173/error?status=400&message=Invalid or expired token`);
    }

    if (new Date() > existingToken.expiresAt) {
      await existingToken.destroy();
      // return res.status(400).json({ message: 'Token has expired.' });
      return res.redirect(`http://localhost:5173/error?status=400&message=Token has expired.`);
    }

    const user = await User.findByPk(existingToken.userId);
    if (!user) {
      // return res.status(404).json({ message: 'User not found.' });
      return res.redirect(`http://localhost:5173/error?status=404&message=User not found.`);
    }

    user.isVerified = true;
    await user.save();

    await existingToken.destroy();

    res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
    // res.status(200).json({ message: 'Email successfully verified. You can now log in.' });
  } catch (error) {
    console.error('Email verification error:', error);
    // res.status(500).json({ message: 'Something went wrong during verification.' });
    return res.redirect(`http://localhost:5173/error?status=500&message=Something went wrong during verification.`);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const accessToken = generateToken({ userId: user.id, role: user.role }, '15m');
    const refreshToken = generateToken({ userId: user.id, role: user.role }, '7d');

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token found' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const accessToken = generateToken(
      { userId: decoded.userId, role: decoded.role },
      '15m'
    );

    res.status(200).json({
      message: 'Access token refreshed',
      accessToken
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

exports.logout = async (req, res) => {
  try {
    // Clear the refreshToken cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'Strict'
    });

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    await Token.destroy({ where: { userId: user.id, type: 'resetPassword' } });

    const tokenValue = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await Token.create({
      userId: user.id,
      token: tokenValue,
      type: 'resetPassword',
      expiresAt
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${tokenValue}`;

    await sendEmail({
      to: user.email,
      subject: 'Reset your password',
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; text-align: center;">
          <h2 style="color: #333;">Password Reset Request 🔒</h2>
          <p style="color: #555; font-size: 15px;">
            You requested to reset your password. Click the button below to proceed.
          </p>
          <a href="${resetUrl}" 
             style="display: inline-block; margin-top: 20px; padding: 12px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
             Reset Password
          </a>
          <p style="color: #555; font-size: 14px; margin-top: 25px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="word-break: break-all; font-size: 13px; color: #007bff;">
            ${resetUrl}
          </p>
          <p style="color: #999; font-size: 13px; margin-top: 20px;">
            This reset link will expire in <strong>1 hour</strong>.
          </p>
          <p style="color: #bbb; font-size: 12px; margin-top: 30px;">
            If you didn’t request this, please ignore this email.
          </p>
        </div>
      </div>
    `
    });

    res.status(200).json({ message: 'Password reset link has been sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ message: 'Password is required' });

    const dbToken = await Token.findOne({
      where: {
        token,
        type: 'resetPassword',
        expiresAt: { [Op.gt]: new Date() }
      },
      include: User
    });

    if (!dbToken || !dbToken.User) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    dbToken.User.password = hashedPassword;
    await dbToken.User.save();

    await dbToken.destroy();

    res.status(200).json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Reset failed. Please try again later.' });
  }
};

