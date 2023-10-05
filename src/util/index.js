const jwt = require('jsonwebtoken');
const accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET;


const generateTokens = (payload) => {
    const accessToken = jwt.sign(payload, accessTokenSecret, {
        expiresIn: '1m',
    });
    const refreshToken = jwt.sign(payload, refreshTokenSecret, {
        expiresIn: '1y',
    });
    return { accessToken, refreshToken };
}

const verifyRefreshToken = (refreshToken) => {
    return jwt.verify(refreshToken, refreshTokenSecret);
}



module.exports = { generateTokens, verifyRefreshToken };