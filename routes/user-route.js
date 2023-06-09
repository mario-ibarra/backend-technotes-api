const express = require('express')
const router = express.Router()
const userController = require('../controllers/user-controller')

const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.get('/', userController.getAllUsers)
router.get('/:id', userController.getSingleUser)
router.post('/', userController.createNewUser)
router.patch('/', userController.updateUser)
router.delete('/', userController.deleteUser)

module.exports = router
