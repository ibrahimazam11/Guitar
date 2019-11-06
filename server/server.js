const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express()

mongoose.set('useCreateIndex', true);
mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({ extended: true, }));
app.use(bodyParser.json());
app.use(cookieParser());

// Models
const User = require('./models/user');
const Brand = require('./models/brand');
const Wood = require('./models/wood');
const Product = require('./models/product');

// Middlewares
const { auth } = require('./middleware/auth');
const { admin } = require('./middleware/admin');


//========================================//
//              PRODUCTS                  //
//========================================//

// BY ARRIVAL
app.get('/api/product/articles', auth, async (req, res) => {
    try {
        let order = req.query.order ? req.query.order : 'asc',
            sortBy = req.query.sortBy ? req.query.sortBy : '_id',
            limit = +req.query.limit ? +req.query.limit : 10;

        let articles = await Product.find().populate('brand').populate('wood')
            .sort([[sortBy, order]]).limit(limit).lean();
        res.status(200).json({
            success: true,
            data: articles
        })
    } catch (error) {
        res.status(400).json({ success: false, data: error.message })
    }
})

app.get('/api/product/articlesById', auth, async (req, res) => {
    try {
        let type = req.query.type;
        let items = req.query.id;

        if (type === 'array') {
            let ids = items.split(',')
            items = []
            items = ids.map(item => {
                return mongoose.Types.ObjectId(item)
            })
        }

        let articles = await Product.find({ _id: items }).populate('brand').populate('wood').lean()
        res.status(200).json({
            success: true,
            data: articles
        })

    } catch (error) {
        res.status(400).json({ success: false, data: error.message })
    }
})

app.post('/api/product/article', auth, async (req, res) => {
    try {
        const product = new Product(req.body)
        let saveProduct = await product.save();
        res.status(200).json({
            success: true,
            data: saveProduct
        })
    } catch (error) {
        res.status(400).json({ success: false, data: error.message })
    }
})

//========================================//
//              WOODS                     //
//========================================//

app.post('/api/product/wood', auth, async (req, res) => {
    try {
        const wood = new Wood(req.body)
        let saveWood = await wood.save();
        res.status(200).json({
            success: true,
            data: saveWood
        })
    } catch (error) {
        res.status(400).json({ success: false, data: error.message })
    }
})

app.get('/api/product/woods', auth, async (req, res) => {

    try {
        let woods = await Wood.find().lean()
        res.status(200).json({
            success: true,
            data: woods
        })

    } catch (error) {
        res.status(400).json({ success: false, data: error.message })
    }
})


//========================================//
//              BRANDS                    //
//========================================//

app.post('/api/product/brand', auth, admin, async (req, res) => {
    try {
        const brand = new Brand(req.body)
        let saveBrand = await brand.save();
        res.status(200).json({
            success: true,
            data: saveBrand
        })
    } catch (error) {
        res.status(400).json({ success: false, data: error.message })
    }
})

app.get('/api/product/brands', auth, async (req, res) => {

    try {
        let brands = await Brand.find().lean()
        res.status(200).json({
            success: true,
            data: brands
        })

    } catch (error) {
        res.status(400).json({ success: false, data: error.message })
    }
})

//========================================//
//              USERS                     //
//========================================//

app.get('/api/user/auth', auth, async (req, res) => {
    res.status(200).json({
        success: true,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        name: req.user.name,
        lastname: req.user.lastname,
        email: req.user.email,
        role: req.user.role,
        history: req.user.history,
        cart: req.user.cart,
    })
})

app.post('/api/users/register', async (req, res) => {
    try {
        const newUser = new User(req.body)
        let user = await newUser.save();
        return res.status(200).json({ success: true })
    } catch (error) {
        res.status(400).json({ success: false, data: error.message })
    }
})

app.post('/api/users/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })
        if (!user) return res.status(400).json({ success: false, data: "Invalid Email!" })

        let isMatch = await user.comparePassword(req.body.password)
        if (!isMatch) return res.status(400).json({ success: false, data: "Invalid Password!" })

        let userWithToken = await user.generateToken()
        res.cookie('w_auth', userWithToken.token).json({ success: true })

    } catch (error) {
        res.status(400).json({ success: false, data: error.message })
    }
})

app.get('/api/users/logout', auth, async (req, res) => {
    try {
        let user = await User.findOneAndUpdate({ _id: req.user._id }, { token: '' }).lean()
        return res.status(200).json({ success: true, data: "User Logged out!" })
    } catch (error) {
        return res.status(400).json({ success: false, data: error.message })
    }
})

const port = process.env.PORT || 3002;

app.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})