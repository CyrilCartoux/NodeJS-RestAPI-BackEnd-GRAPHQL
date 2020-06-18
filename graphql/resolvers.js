const User = require("./../models/user")
const bcrypt = require("bcryptjs");
const validator = require("validator");

module.exports = {
    createUser: async function ({ userInput }, req) {
        const errors = [];
        if (!validator.isEmail(userInput.email)) {
            errors.push({ message: "Email is invalid" })
        }
        if (validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, { min: 5 })) {
            errors.push({ message: "Password must be greater than 5 characters" })
        }
        if (errors.length > 0) {
            const error = new Error("Invalid input")
            error.data = errors
            error.code = 422
            throw error;
        }
        const existingUser = await User.findOne({ email: userInput.email })
        if (existingUser) {
            const error = new Error("User exists already")
            throw error;
        }
        try {
            const hashedPassword = await bcrypt.hash(userInput.password, 12)

            const user = new User({
                email: userInput.email,
                password: hashedPassword,
                name: userInput.name
            })
            const createdUser = await user.save()
            return { ...createdUser._doc, _id: createdUser._id.toString() }

        } catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            console.log(err);
        }
    }
}