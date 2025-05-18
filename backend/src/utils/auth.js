// Add these requires at the top of your file
const ActiveDirectory = require('activedirectory2');
const session = require('express-session');
const os = require('os');

// Get current domain
const domain = os.hostname().split('.').slice(1).join('.');

// Add session middleware after your existing middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Improved AD authentication function
async function authenticateAD(username, password) {
    // If username doesn't include domain, add it
    const userPrincipal = username.includes('@') ? username : `${username}@${domain}`;
    
    const config = {
        url: `ldap://${domain}`,
        baseDN: domain.split('.').map(dc => `DC=${dc}`).join(','),
        username: userPrincipal,
        password: password,
        attributes: {
            user: [
                'sAMAccountName', 
                'displayName', 
                'mail', 
                'memberOf',
                'department',
                'title'
            ]
        }
    };

    return new Promise((resolve, reject) => {
        const ad = new ActiveDirectory(config);
        
        ad.authenticate(userPrincipal, password, (err, auth) => {
            if (err) {
                console.error('AD Authentication error:', err);
                reject(new Error('Authentication failed'));
                return;
            }
            
            if (!auth) {
                reject(new Error('Invalid credentials'));
                return;
            }

            // Get user details
            ad.findUser(userPrincipal, (err, user) => {
                if (err || !user) {
                    reject(new Error('User not found'));
                    return;
                }
                resolve(user);
            });
        });
    });
}

// Replace your current authenticateToken function with this improved version
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token is invalid or expired' });
        }
        req.user = user;
        next();
    });
}

// Add login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ 
            error: 'Username and password are required' 
        });
    }

    try {
        const user = await authenticateAD(username, password);
        
        const userPayload = {
            username: user.sAMAccountName,
            displayName: user.displayName,
            email: user.mail,
            department: user.department,
            title: user.title,
            groups: user.memberOf?.map(group => 
                group.split(',')[0].replace('CN=', '')
            ) || []
        };

        const token = jwt.sign(
            userPayload,
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '8h' }
        );

        // Store minimal user info in session
        req.session.user = {
            username: user.sAMAccountName,
            displayName: user.displayName
        };

        res.json({ 
            token,
            user: userPayload
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ 
            error: 'Invalid credentials or account not found' 
        });
    }
});