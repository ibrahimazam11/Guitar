let admin = async (req, res, next) => {
    if (req.user.role === 0) {
        res.status(200).json({
            success: false,
            data: "You are not allowed here!"
        })
    }

    next()
}

module.exports = { admin }