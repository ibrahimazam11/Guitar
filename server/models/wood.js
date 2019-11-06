const mongoose = require('mongoose')

const woodSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: 1,
        maxLength: 100
    }
})

module.exports = mongoose.model('Wood', woodSchema)