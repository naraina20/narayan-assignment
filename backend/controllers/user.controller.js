const { User } = require('../models');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const sequelize = require('sequelize');
const { Op } = require('sequelize');

exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const offset = (page - 1) * limit;


    const { count, rows } = await User.findAndCountAll({
      where: {
        [Op.or]: [
          { email: { [Op.like]: `%${search}%` } },
          { name: { [Op.like]: `%${search}%` } }
        ]
      },
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      totalUsers: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      offset: (page - 1) * limit,
      users: rows
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (role && !['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be "admin" or "user"' });
    }

    user.role = role || user.role;
    await user.save();
    res.status(200).json({ message: 'User updated by admin',user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateOwnProfile = async (req, res) => {
  const id = req.user.userId; // from token

  const { name, role } = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }
  const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (role && !['admin', 'user'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Must be "admin" or "user"' });
  }

  user.name = name || user.name;
  user.role = role || user.role
  await user.save();

  res.status(200).json({ message: 'Profile updated', user});
};


exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};