const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            console.log("🔹 Decoded Token:", decoded); // Debug log

            req.user = { id: decoded.id, role: decoded.role }; // Set user
            if (!req.user.id) {
                return res.status(401).json({ message: "User ID missing in token" });
            }
            next();
        } catch (error) {
            console.error("🔴 Auth Error:", error);
            return res.status(401).json({ message: "Invalid token" });
        }
    } else {
        return res.status(401).json({ message: "No token, authorization denied" });
    }
};

const teacherOnly = (req, res, next) => {
    if (req.user && req.user.role === 'teacher') {
        return next(); 
    } else {
        return res.status(403).json({ message: 'Access denied. Teachers only.' });
    }
};

module.exports = { protect, teacherOnly };
