/* eslint-disable import/first */
require('dotenv').config()
const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const { logger, logEvents } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const connectDB  = require ('./config/dbConn')
const mongoose = require  ('mongoose')
const userRoutes = require('./routes/user-route')
const noteRoutes = require('./routes/note-route')
const PORT = process.env.PORT || 3500

console.log(process.env.NODE_ENV)

connectDB()

app.use(logger)


/* || Midlewares */
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {res.send('Hello World!')})

/* || Routes */
app.use('/auth', require('./routes/authRoutes'))
app.use('/notes', noteRoutes)
app.use('/users', userRoutes)


app.use(errorHandler)

mongoose.connection.once('open', () => { 
  console.log('connected to Mongo db')
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})

mongoose.connection.on('error', err => {
  console.log(err)
  logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})

