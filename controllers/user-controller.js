const User = require('../models/User-model')
const Note = require('../models/Note-model')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').lean()
  if (!users?.length) {
    return res.status(400).json({ message: 'No users found' })
  }
  res.json(users)
})

// @desc Get single user
// @route GET /users/:id
// @access Private
const getSingleUser = asyncHandler(async (req, res) => {
  const { id } = req.params
  const user = await User.findById(id).exec()
  if (!user) {
    return res.status(400).json({ message: 'No user with that id found' })
  }
  res.json(user)
})

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body
  // Confirm data
  if (!username || !password) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  // Check for duplicates
  const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2}).lean().exec()

  if (duplicate) {
    return res.status(409).json({ message: 'username allredy exists' })
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10) // salt rounds

  const userObject =
    !Array.isArray(roles) || !roles.length
      ? { username, password: hashedPassword }
      : { username, password: hashedPassword, roles }

  // Create and store new user
  const user = await User.create(userObject)

  if (user) {
    res.status(201).json({ user: user.toObject({getters:true}), message: `New user ${username} created` })
    
  } else {
    res.status(400).json({ message: 'Invalid user data received' })
  }
})

// @desc Update User
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const {id, username, roles, active, password} = req.body

  // Confirm data
  if (!id ||!username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
    return res.status(400).json({ message: 'All fields are required' })
  }

  const user = await User.findById(id).exec()

  // check for existance
  if (!user){
    return res.status(400).json({ message: 'User not found' })    
  }
  // Check for duplicate
  const duplicate = await User.findOne({ username })
    .collation({ locale: 'en', strength: 2 })
    .lean()
    .exec()

  // Allow update to the original user
  if (duplicate && duplicate?._id.toString() !== id){
    return res.status(409).json({ message: 'Duplicate username' })
  }

  user.username = username
  user.roles = roles
  user.active = active

  if (password) {
    // Hash password
    user.password = await bcrypt.hash(password, 10) // 10 is the round salt
  }

  const updatedUser = await user.save()

  res.json({message: `${updatedUser.username} updated`})
})

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'User ID Required' })

    }

    const note = await Note.findOne({ user: id}).lean().exec()
    if (note){
        return res.status(400).json({ message: 'User has assigned notes' })
    }

    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User with that ID not found' })
    }

    const result = await user.deleteOne()
    const replay = `Username ${result.username} with ID ${result._id} deleted`

    res.json(replay)


})

module.exports = {
  getAllUsers,
  getSingleUser,
  createNewUser,
  updateUser,
  deleteUser,
}
