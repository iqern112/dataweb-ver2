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


// ฟังก์ชันสำหรับคิวรี่ข้อมูล nationality
async function querydata() {
}

app.get('/api/dashboard/:year', (req, res) => {
    const year = req.params.year;
    const tableName = `fifa${year}`;

    const query = `
        SELECT 
            COUNT(*) AS totalPlayers,
            MAX(overall) AS avgMaxOverall,
            COUNT(DISTINCT club_name) AS teamCount
        FROM ${tableName};
    `;

    db.query(query, (err, results) => {
        if (err) throw err;
        
        res.json({
            totalPlayers: results[0].totalPlayers,
            avgMaxOverall: results[0].avgMaxOverall,
            yearComparison: 'เพิ่มขึ้น 10%', // ข้อมูลนี้สามารถคำนวณได้เพิ่มในภายหลัง
            teamCount: results[0].teamCount,
            playerEachLevel: { "1": 20, "2": 10 } // ข้อมูลตัวอย่าง
        });
    });
});

// Route แสดงข้อมูลหน้าแรก
app.get('/', async (req, res) => {
    const data = await querydata(); // คิวรีข้อมูล nationality
    res.render('index', { data }); // ส่งข้อมูลไปยังหน้า index
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
