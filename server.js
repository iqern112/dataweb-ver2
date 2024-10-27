// master
// server.js

const express = require('express');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

// สร้างแอปพลิเคชัน Express
const app = express();

// กำหนดให้ใช้ EJS เป็น view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// สร้าง pool การเชื่อมต่อกับ PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// ฟังก์ชันสำหรับคิวรี่ข้อมูลจากฐานข้อมูล
async function queryDatabase() {
    try {
        const result = await pool.query('SELECT * FROM "fifa22" LIMIT 10');
        return result.rows;  // คืนค่าข้อมูลที่ได้
    } catch (err) {
        console.error('เกิดข้อผิดพลาด:', err);
        return null;
    }
}

// Route สำหรับแสดงข้อมูล
app.get('/', async (req, res) => {
    const data = await queryDatabase();  // คิวรี่ข้อมูล
    if (data) {
        res.render('index', { data });  // เรนเดอร์เทมเพลตพร้อมข้อมูล
    } else {
        res.send("เกิดข้อผิดพลาดในการคิวรี่ข้อมูล");
    }
});

// เริ่มเซิร์ฟเวอร์
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
