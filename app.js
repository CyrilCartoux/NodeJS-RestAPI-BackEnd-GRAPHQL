const path = require("path")
const express = require("express");
const bodyParser = require("body-parser")
const db = require("./util/database").db;
const multer = require("multer")
const uuidv4 = require('uuid').v4
const graphqlHttp = require("express-graphql")
const graphqlSchema = require("./graphql/schema")
const graphqlResolver = require("./graphql/resolvers")

const app = express();

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images');
    },
    filename: function(req, file, cb) {
        cb(null, uuidv4())
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

app.use(bodyParser.json())

app.use(multer({ storage: storage, fileFilter: fileFilter }).single("image"))

app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use("/graphql", graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver
}))

// handle errors
app.use((error, req, res, next) => {
    console.log(error)
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data })
})
// database connexion
db()
    .then(result => {
        console.log('connected')
        app.listen(8080);
    })
    .catch(err => {
        console.log(err)
    })

