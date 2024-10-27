const express = require('express');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// การเชื่อมต่อฐานข้อมูล PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});


// ฟังก์ชันสำหรับคิวรี่ข้อมูลตาม table ที่ส่งมา
async function queryDatabase(yearTable) {
    if (!yearTable) {
        console.error('yearTable is undefined');
        return null;
    }

    try {
        const result = await pool.query(`SELECT * FROM "${yearTable}" LIMIT 10`);
        return result.rows;
    } catch (err) {
        console.error('เกิดข้อผิดพลาด:', err);
        return null;
    }
}


// Route แสดงข้อมูลหน้าแรก
app.get('/', async (req, res) => {
    const yearTable = 'fifa22';
    const data = await queryDatabase(yearTable);
    res.render('index', { data });
});

// Route สำหรับข้อมูลปีที่เลือก
app.get('/data/:yearTable', async (req, res) => {
    const yearTable = req.params.yearTable;
    const data = await queryDatabase(yearTable);
    res.json(data || { error: 'ไม่พบข้อมูล' });
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
