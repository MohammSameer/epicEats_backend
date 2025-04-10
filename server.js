//importing required modules
const { body, validationResult } = require('express-validator')
const express = require('express')
const mongoose = require('mongoose')
const jwt= require('jsonwebtoken')
require('dotenv').config()
const User = require('./models/Users')
const bycrpt = require('bcryptjs')
const jwtSecret= "mynameisspidermanwhosavespeopleandkillsvillian#$!"
const itemRoute= require('./Routes/itemRoute')
const CategoryRoute=require('./Routes/categoryRoute')
const OrderDataRoute=require('./Routes/OrderDataRoute')
const cors = require('cors');


//middle ware
const PORT = process.env.PORT || 10000
const app = express()
app.use(express.json())
app.use(cors({
    origin: ['http://localhost:3000','https://epic-eats-frontend.vercel.app/'], 
    credentials: true
  }));


//database connection
mongoose.connect(process.env.MONGO_URL).then(
    () => console.log("Database connected successfully...")
).catch(
    (error) => console.log(error)
)

//API home page
app.get('/', async (req, res) => {
    try {
        res.send("<h1>Welcome to Backend</h1>")
    } catch (error) {
        console.log(error)
    }
})

// API registration page
app.post('/register', body('email', 'incorrect email').isEmail(),
    body('password', 'password should be minimum 6 characters').isLength({ min: 5 }),
    async (req, res) => {
        const { firstName, lastName, email, phoneNumber, password, confirmPassword } = req.body
        const errors = validationResult(req)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() })
        }
        try {
            const hashPassword = await bycrpt.hash(password, 10)
            const newUser = new User({ firstName, lastName, email, phoneNumber, password: hashPassword, confirmPassword: hashPassword })
            await newUser.save()
            console.log("new user registered successfully...")
            return res.status(200).json({ success: true, message: 'Successfully Registered...' });
        }
        catch (error) {
            console.log(error)
        }
    })

//API login page
app.post('/login', async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })
        if (!user || !(await bycrpt.compare(password, user.password))) {
            return res.status(400).json({ success: false, message: 'Invalid Credentials' })
        }
        const data= {
            user: {
                id :user.id
            }
        }
        const authToken=jwt.sign(data,jwtSecret)
        return res.status(200).json({ success: true, authToken:authToken, username:user.firstName, message: 'login successfull' });

    } catch (error) {
        console.log(error)
    }
})


//API foodItems and foodcateorgy
app.use('/api',itemRoute)
app.use('/api',CategoryRoute)
app.use('/api',OrderDataRoute)


//port configuration
app.listen(PORT, (error) => {
    if (error) {
        console.log(error)
    } else {
        console.log("server is running on port :" + PORT)
    }
})