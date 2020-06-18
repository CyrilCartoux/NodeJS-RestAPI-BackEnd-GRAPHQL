const User = require("./../models/user")
const user = require("./../models/user")
const bcrypt = require("bcryptjs");

module.exports = {
    createUser: async function ({ userInput }, req) {
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
            return {...createdUser._doc, _id: createdUser._id.toString()}
            
        } catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            console.log(err);
        }
    }
}