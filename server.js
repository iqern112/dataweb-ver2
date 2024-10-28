const express = require('express');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// การเชื่อมต่อฐานข้อมูล PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});


// ฟังก์ชันสำหรับคิวรี่ข้อมูลตาม table ที่ส่งมา
async function queryDatabase(yearTable, columns) {
    if (!yearTable) {
        console.error('yearTable is undefined');
        return null;
    }

    const selectedColumns = columns && columns.length > 0 ? columns.join(', ') : '*';

    try {
        const result = await pool.query(`SELECT ${selectedColumns} FROM "${yearTable}" LIMIT 10`);
        return result.rows;
    } catch (err) {
        console.error('เกิดข้อผิดพลาด:', err);
        return null;
    }
}

async function queryNationalities() {
    try {
        const result = await pool.query(`
            SELECT nationality_name AS nationality, COUNT(*) AS count 
            FROM fifa22 
            GROUP BY nationality_name
        `);
        console.log(result.rows); // แสดงข้อมูลใน terminal
        return result.rows;
    } catch (err) {
        console.error('เกิดข้อผิดพลาด:', err);
        return null;
    }
}

// Route แสดงข้อมูลหน้าแรก
app.get('/', async (req, res) => {
    const data = await queryDatabase();
    res.render('index', { data });
});

app.get('/dashboard', async (req, res) => {
    const data = await queryNationalities();
    res.render('dashboard', { data });
});

// Route สำหรับข้อมูลปีที่เลือก
app.get('/data/:yearTable', async (req, res) => {
    const yearTable = req.params.yearTable;
    const data = await queryDatabase(yearTable);
    res.json(data || { error: 'ไม่พบข้อมูล' });
});

app.get('/get-nationalities', async (req, res) => {
    try {
        const nationalities = await queryNationalities();
        res.json(nationalities); // ส่งข้อมูลเป็น JSON
    } catch (err) {
        console.error('เกิดข้อผิดพลาด:', err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
});


// Route ตรวจสอบข้อมูลการเข้าสู่ระบบ
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
        
        if (result.rows.length > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (err) {
        console.error('เกิดข้อผิดพลาด:', err);
        res.json({ success: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
