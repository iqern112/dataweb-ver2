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
async function queryDatabase(yearTable = "fifa22", columns) {
    if (!yearTable) {
        console.error('yearTable is undefined');
        return yearTable = "fifa22";
    }

    const selectedColumns = columns && columns.length > 0 ? columns.join(', ') : '*';
    const year = yearTable

    try {
        const result = await pool.query(`SELECT * FROM "${year}" LIMIT 10`);
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

app.get('/data/:year', async (req, res) => {
    const year = req.params.year;
    const sql = `SELECT * FROM "${year}" LIMIT 10`; // แก้ไขเป็นตารางตามปี
    try {
        const result = await pool.query(sql);
        const data = result.rows || []; // กำหนดค่าให้ data เป็น array ว่างหากไม่มีข้อมูล
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).render('index', { data: [] }); // ส่ง array ว่างในกรณีที่เกิดข้อผิดพลาด
    }
});

app.get('/dashboard', async (req, res) => {
    try {
        // เริ่มต้นด้วยปี 2022
        const year = 'fifa22'; // กำหนดปีเริ่มต้น
        const sql = `SELECT COUNT(*) AS count FROM ${year}`;
        const result = await pool.query(sql);

        const data = result.rows || []; // กำหนดค่าให้ data เป็น array ว่างหากไม่มีข้อมูล
        res.render('dashboard', { data, year }); // ส่งข้อมูลไปยัง EJS
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).render('dashboard', { data: [], year: 'fifa22' });
    }
});

app.get('/dashboard/data/:year', async (req, res) => {
    const year = req.params.year;
    const sql = `SELECT COUNT(*) AS count FROM ${year}`; // แก้ไขเป็นตารางตามปี
    try {
        const result = await pool.query(sql);
        const data = result.rows || []; // กำหนดค่าให้ data เป็น array ว่างหากไม่มีข้อมูล
        console.log(data); // แสดงข้อมูลใน console
        res.json(data); // ส่งข้อมูลเป็น JSON
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send([]); // ส่ง array ว่างในกรณีที่เกิดข้อผิดพลาด
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
