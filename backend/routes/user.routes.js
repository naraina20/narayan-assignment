const express = require('express');
const { getMyProfile, getAllUsers, updateOwnProfile, updateUserByAdmin, deleteUser } = require('../controllers/user.controller');
const { authentication, authorization } = require('../middleware/auth.middleware');
const router = express.Router();

router.get('/me/:id', authentication, getMyProfile)
router.get('/list', authentication, getAllUsers)
router.put('/me/:id', authentication, updateOwnProfile)
router.put('/edit-user/:id', authentication, authorization('admin'), updateUserByAdmin)
router.delete('/delete/:userId',authentication, deleteUser)
module.exports  = router