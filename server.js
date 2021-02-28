const express = require('express');
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const PORT = process.env.PORT || 5055;

require('dotenv').config()
const client = require('./redis')()
client.on("error", (e) => console.error(e));
require('./src/models')


// socket io
require('./sockets')(server)

// Configs
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));
app.use(helmet());
app.use(morgan("dev"));
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());
require('./passport');

// Routes
app.use('/', (require('./src/routes')));

app.use('/', (req, res) => res.status(404).render('index', { err: "Unknown path" }))

server.listen(PORT, "0.0.0.0", () => console.log(`server listening on port: ${PORT}`)); 