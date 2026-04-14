const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static assets first (skip .html files so EJS catches them)
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// Configure EJS with html files
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);

// --- Auth Middleware ---
const authenticateUser = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.redirect('/Pages/login.html');
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.clearCookie('token');
        return res.redirect('/Pages/login.html');
    }
};

const authenticateAdmin = async (req, res, next) => {
    const adminToken = req.cookies.adminToken;
    if (!adminToken) return res.redirect('/Pages/admin/adminlogin.html');
    
    try {
        const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') throw new Error('Not admin');
        req.admin = decoded;
        next();
    } catch (err) {
        res.clearCookie('adminToken');
        return res.redirect('/Pages/admin/adminlogin.html');
    }
};

// Global Auth Extractor (Non-blocking)
const extractAuthOptional = (req, res, next) => {
    req.userAuth = null;
    req.adminAuth = null;
    
    if (req.cookies.token) {
        try { req.userAuth = jwt.verify(req.cookies.token, process.env.JWT_SECRET); } catch (e) {}
    }
    if (req.cookies.adminToken) {
        try { req.adminAuth = jwt.verify(req.cookies.adminToken, process.env.JWT_SECRET); } catch (e) {}
    }
    next();
};

app.use(extractAuthOptional);

// --- Page Routes ---

app.get('/', (req, res) => {
    res.render(path.join(__dirname, 'index.html'), { user: req.userAuth, admin: req.adminAuth });
});

// Protect user dashboard
app.get('/Pages/dashboard.html', authenticateUser, async (req, res) => {
    try {
        const [bookings] = await db.query(`
            SELECT b.*, d.name as destination 
            FROM bookings b 
            LEFT JOIN destinations d ON b.destination_id = d.destination_id
            WHERE b.user_id = ? 
            ORDER BY b.BookingNum DESC
        `, [req.user.id]);
        
        const formattedBookings = bookings.map(b => ({
            ...b,
            travel_date: b.TourDate,
            destination: b.destination || 'Unknown Destination'
        }));
        
        res.render('Pages/dashboard.html', { user: req.userAuth, admin: req.adminAuth, bookings: formattedBookings });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error in Dashboard: ' + error.message);
    }
});

// Protect admin page
app.get('/Pages/admin/adminpage.html', authenticateAdmin, async (req, res) => {
    try {
        const [users] = await db.query('SELECT COUNT(*) as count FROM users');
        const [bookingsData] = await db.query(`
            SELECT b.*, d.name as destination 
            FROM bookings b
            LEFT JOIN destinations d ON b.destination_id = d.destination_id
            ORDER BY b.BookingNum DESC
        `);
        
        const totalRevenue = bookingsData.reduce((sum, booking) => sum + parseFloat(booking.total_price || 0), 0);
        
        const formattedBookings = bookingsData.map(b => ({
            ...b,
            amount: b.total_price,
            destination: b.destination || 'Unknown Destination'
        }));
        
        res.render('Pages/admin/adminpage.html', { 
            user: req.userAuth,
            admin: req.adminAuth, 
            totalUsers: users[0].count,
            totalBookings: bookingsData.length,
            totalRevenue: totalRevenue.toFixed(2),
            bookings: formattedBookings
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error in Admin Page: ' + error.message);
    }
});

// Render Dynamic Tours Catalog
app.get('/Pages/tours.html', async (req, res) => {
    try {
        const [destinations] = await db.query('SELECT * FROM destinations ORDER BY destination_id ASC');
        res.render('Pages/tours.html', { user: req.userAuth, admin: req.adminAuth, destinations });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading destinations: ' + error.message);
    }
});

// Catch-all for HTML files to render EJS tags (Dynamic Navbar)
app.get(/\.html$/, (req, res, next) => {
    const filePath = path.join(__dirname, req.path);
    res.render(filePath, { user: req.userAuth, admin: req.adminAuth }, (err, html) => {
        if (err) {
            next();
        } else {
            res.send(html);
        }
    });
});

// --- API Routes ---

// API Logouts
app.get('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

app.get('/api/auth/admin/logout', (req, res) => {
    res.clearCookie('adminToken');
    res.redirect('/');
});

// User Registration
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).send('Email already exists');
        
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
        
        res.redirect('/Pages/login.html');
    } catch (error) {
        console.error(error);
        res.status(500).send('Registration Error: ' + error.message);
    }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];
        
        if (!user) return res.status(400).send('Invalid credentials');
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword && password !== user.password) { // fallback to clear text if they inserted manually
            return res.status(400).send('Invalid credentials');
        }
        
        const token = jwt.sign({ id: user.user_id, username: user.username, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.cookie('token', token, { httpOnly: true });
        
        res.redirect('/Pages/dashboard.html');
    } catch (error) {
        console.error(error);
        res.status(500).send('Login Error: ' + error.message);
    }
});

// Admin Login
app.post('/api/auth/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if(users.length === 0) return res.status(400).send('Admin user not found');
        
        const user = users[0];
        
        const [admins] = await db.query('SELECT * FROM admin WHERE user_id = ?', [user.user_id]);
        const admin = admins[0];
        
        if (!admin) return res.status(400).send('Not an admin account');
        
        if(admin.password !== password) {
             const validPassword = await bcrypt.compare(password, admin.password);
             if (!validPassword) return res.status(400).send('Invalid admin credentials');
        }
        
        const adminToken = jwt.sign({ id: admin.user_id, email: user.email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.cookie('adminToken', adminToken, { httpOnly: true });
        
        res.redirect('/Pages/admin/adminpage.html');
    } catch (error) {
        console.error(error);
        res.status(500).send('Admin Login Error: ' + error.message);
    }
});

// Book a trip
app.post('/api/bookings', authenticateUser, async (req, res) => {
    try {
        const { destination, amount, date, travelers } = req.body;
        
        const searchQuery = destination.split(',')[0].trim();
        const [dests] = await db.query('SELECT destination_id FROM destinations WHERE name LIKE ?', ['%' + searchQuery + '%']);
        
        const parsedAmount = amount ? amount.replace(/[^0-9.]/g, '') : '0';
        let destId;
        
        if (dests.length > 0) {
            destId = dests[0].destination_id;
        } else {
            // Automatically populate destination if it's missing in DB
            const [result] = await db.query('INSERT INTO destinations (name, price) VALUES (?, ?)', [destination, Number(parsedAmount)]);
            destId = result.insertId;
        }
        
        const numTravelers = travelers || 1;
        
        console.log('--- NEW BOOKING TRIGGERED --- Setting status as: pending');
        
        await db.query('INSERT INTO bookings (user_id, destination_id, TourDate, Guests, total_price, status) VALUES (?, ?, ?, ?, ?, ?)', 
            [req.user.id, destId, date, numTravelers, parsedAmount, 'pending']);
        
        res.redirect('/Pages/dashboard.html');
    } catch (error) {
        console.error(error);
        res.status(500).send('Booking Error: ' + error.message);
    }
});

app.post('/api/bookings/:id/cancel', authenticateUser, async (req, res) => {
    try {
        const bookingId = req.params.id;
        const [bookings] = await db.query('SELECT * FROM bookings WHERE BookingNum = ? AND user_id = ?', [bookingId, req.user.id]);
        if (bookings.length === 0) return res.status(403).send('Unauthorized or not found');
        
        await db.query('UPDATE bookings SET status = ? WHERE BookingNum = ?', ['cancelled', bookingId]);
        res.redirect('/Pages/dashboard.html');
    } catch (e) {
        console.error(e);
        res.status(500).send('Error cancelling booking: ' + e.message);
    }
});

app.post('/api/admin/bookings/:id/confirm', authenticateAdmin, async (req, res) => {
    try {
        const bookingId = req.params.id;
        await db.query('UPDATE bookings SET status = ? WHERE BookingNum = ?', ['confirmed', bookingId]);
        res.redirect('/Pages/admin/adminpage.html');
    } catch (e) {
        console.error(e);
        res.status(500).send('Error confirming booking: ' + e.message);
    }
});

app.post('/api/admin/bookings/:id/cancel', authenticateAdmin, async (req, res) => {
    try {
        const bookingId = req.params.id;
        await db.query('UPDATE bookings SET status = ? WHERE BookingNum = ?', ['cancelled', bookingId]);
        res.redirect('/Pages/admin/adminpage.html');
    } catch (e) {
        console.error(e);
        res.status(500).send('Error cancelling booking: ' + e.message);
    }
});

app.post('/api/admin/destinations', authenticateAdmin, async (req, res) => {
    try {
        const { name, price, location, image_url } = req.body;
        const parsedPrice = price ? price.toString().replace(/[^0-9.]/g, '') : '0';
        await db.query(`INSERT INTO destinations (name, price, image_url, location, dest_url) VALUES (?, ?, ?, ?, ?)`, 
        [name, parsedPrice, image_url, location, '#']);
        res.redirect('/Pages/admin/adminpage.html');
    } catch (e) {
        console.error(e);
        res.status(500).send('Error adding course: ' + e.message);
    }
});

// Fallback to static files
app.use(express.static(__dirname));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});
