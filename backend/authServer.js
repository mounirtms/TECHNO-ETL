import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();

app.use(express.json())

let refreshTokens = [],
    users = [
        {
            username:"MounirTms",
            super:true
        }
    ];

app.post('/token', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ name: user.name })
        res.json({ accessToken: accessToken })
    })
})

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
});

app.post('/login', (req, res) => {
    // Authenticate User

    const { username } = req.body

    const accessToken = generateAccessToken(username)
    const refreshToken = jwt.sign({
        username: username,
        'TechnoApp': 'authServer',
        'time': Date.now(),
    }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' })
    refreshTokens.push(refreshToken)
    res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

function generateAccessToken(username) {
    return jwt.sign({
        username: username,
        'TechnoApp': 'authServer',
        'time': Date.now(),
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m' })
}

app.listen(4000)
console.log('Auth Server running on port 4000') 
