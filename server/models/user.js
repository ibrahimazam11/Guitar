const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const SALT_I = 10;
require('dotenv').config();

const userSchema = mongoose.Schema({
    email: {
        type: String,
        require: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        require: true,
        minlength: 5
    },
    name: {
        type: String,
        require: true
    },
    lastname: {
        type: String,
        require: true
    },
    cart: {
        type: Array,
        default: []
    },
    history: {
        type: Array,
        default: []
    },
    role: {
        type: Number,
        default: 0
    },
    token: {
        type: String
    }
})

userSchema.pre('save', function (next) {
    let user = this;
    if (user.isModified('password')) {
        bcrypt.genSalt(SALT_I, function (err, salt) {
            if (err) return next(err)
            else {
                bcrypt.hash(user.password, salt, function (err, hash) {
                    if (err) return next(err);
                    user.password = hash
                    next()
                })
            }
        })
    }
    else
        next();
})

userSchema.methods.comparePassword = async function (userPassword, cb) {
    // bcrypt.compare(userPassword, this.password, function (err, isMatch) {
    //     if (err) cb(err)
    //     cb(null, isMatch)
    // })
    try {
        let isMatch = await bcrypt.compare(userPassword, this.password)
        return isMatch
    } catch (error) {
        throw new Error(error.message)
    }
}

userSchema.methods.generateToken = async function (cb) {
    try {
        let user = this;
        let token = JWT.sign(user._id.toHexString(), process.env.SECRET)
        user.token = token;
        let userWithToken = await user.save()
        return userWithToken
    } catch (error) {
        throw new Error(error.message)
    }
}

userSchema.statics.findByToken = async function (token, cb) {
    let user = this;
    try {
        JWT.verify(token, process.env.SECRET, async function (err, decode) {
            let userData = await user.findOne({ _id: decode, token: token })
            cb(null, userData)
        })
    } catch (error) {
        cb(error.message)
    }

}

module.exports = mongoose.model('User', userSchema);
