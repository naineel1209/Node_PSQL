import { config } from 'dotenv';
config();

import 'express-async-errors';
import express from 'express';
import http from 'node:http';
import authRoutes from './routes/auth.routes.js';
import privateRoutes from './routes/private.routes.js';
import cors from 'cors';
import logger from './config/winston.config.js';
import pool from './config/db.config.js';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

const app = express();
const server = http.createServer(app);


const PostgresqlStore = connectPgSimple(session);
const sessionStore = new PostgresqlStore({
    conString: process.env.DATABASE_URL,
})


app.use(session({
    store: sessionStore,
    secret: '12345678901234567890',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
}))
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
})
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cors({
    origin: "*",
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
    res.render('welcome');
});

app.use('/auth', authRoutes);

app.use('/private', privateRoutes);

app.use("*", (req, res) => {
    res.statusMessage = "Not Found";
    return res.status(404).send({ body: "Not Found", message: "You are lost somewhere else." });
})

//Error Handling Middleware
app.use((err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

    res.status(500).send({
        message: err.message,
    });
});

async function start() {
    server.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
    });
}

start();

process.on('exit', async (code) => {
    await pool.end();
    console.log(`About to exit with code: ${code}`);
})