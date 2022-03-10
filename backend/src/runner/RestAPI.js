import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import passport from 'passport';

import imageRouter from '@CDN/ImageRouter'
import getRoute from './controller';
import swaggerHandler from './swagger';

const appRun = async () => {
    const controllers = await getRoute();

    const app = express();
    app.use(cors());
    app.use(cookieParser());
    app.use(express.json({ limit: '500mb' }));
    app.use(express.urlencoded({ limit: '500mb', extended: false }));

    app.use(
        passport.initialize({
            passReqToCallback: true,
        }),
    );

    app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, HEAD, OPTIONS');
        res.header('Access-Control-Allow-Origin', '*');
        next();
    });

    app.use('/image', imageRouter)
    app.use('/v1', controllers.router)

    const swagger = swaggerHandler(controllers);
    swagger.forEach( v => app.use(...v) )

    app.get('/', (req, res) => {
        res.type('text/plain');
        res.status(200);
        return res.send('Welcome');
    });

    //커스텀 404 페이지
    app.use((req, res) => {
        res.type('text/plain');
        res.status(404);
        res.send('404 - Not Found');
    });

    //커스텀 500 페이지
    app.use((err, req, res, next) => {
        console.log(err.stack);
        res.type('text/plain');
        res.status(500);
        res.send('500 - Server Error');
    });

    return { app };
};

export default appRun;