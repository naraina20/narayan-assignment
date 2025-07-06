const express = require('express');
const router = express.Router();
const { register, verifyEmail, login, refreshAccessToken, logout, resetPassword, forgotPassword } = require('../controllers/auth.controller');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} = require('../middleware/validate');



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
})

const upload = multer({ storage: storage })

router.post('/register',  upload.single('file'),registerValidation, register);
router.get('/verify-email', verifyEmail);
router.post('/login',loginValidation, login);
router.get('/refresh-access-token', refreshAccessToken);
router.get('/logout', logout);
router.post('/reset-password/:token',resetPasswordValidation, resetPassword);
router.post('/forgot-password',forgotPasswordValidation, forgotPassword)



module.exports = router;