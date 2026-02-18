const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"
    
    console.log('🔐 Auth Header:', authHeader);
    console.log('🔑 Token extrait:', token ? 'PRÉSENT' : 'ABSENT');
    
    if (!token) {
        return res.status(401).json({ error: 'Token manquant' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('❌ Token invalide:', err.message);
            return res.status(401).json({ error: 'Token invalide' });
        }
        
        console.log('✅ User authentifié:', user.userId);
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
