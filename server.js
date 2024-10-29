const express = require('express');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static('public'));

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
        const year = "fifa22"; // กำหนดปีเริ่มต้น
        const sql = `SELECT * FROM "${year}" LIMIT 10`;
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

    // แยกปีออกมาเพื่อหาปีที่ลดลง
    const currentYear = parseInt(year.replace('fifa', ''), 10);
    const previousYear = `fifa${currentYear - 1}`;

    // สร้าง query ที่รวมข้อมูลจากทั้งสองตาราง
    try {
        // Query จากปีปัจจุบัน
        const sqlCurrent = `SELECT COUNT(*) AS count FROM ${year}`;
        const resultCurrent = await pool.query(sqlCurrent);
        const dataCurrent = resultCurrent.rows[0] || { count: 0 }; // ค่าจาก query ปีปัจจุบัน

        let dataPrevious;

        try {
            // Query สำหรับปีที่ลดลง
            const sqlPrevious = `SELECT COUNT(*) AS count FROM ${previousYear}`;
            const resultPrevious = await pool.query(sqlPrevious);
            dataPrevious = resultPrevious.rows[0] || { count: 0 };
        } catch (error) {
            console.warn(`Table ${previousYear} does not exist. Using data from ${year} only.`);
            dataPrevious = null; // กรณีไม่มีตารางของปีที่ลดลง
        }

        // สร้างผลลัพธ์รวม
        const responseData = dataPrevious ? [dataCurrent, dataPrevious] : [dataCurrent, dataCurrent];

        res.json(responseData); // ส่งข้อมูลกลับ
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send([]); 
    }
});

//ดึงข้อมูลให้ chart
app.get('/get-chart/:year', async (req, res) => {
    const year = req.params.year;
    try {
        let pieData;
        let lineData;
        let barData;
        let doughnutData;

        try {
            const sqlPie = `SELECT club_name, COUNT(*) AS player_count
                                FROM ${year}
                                WHERE club_name IS NOT NULL
                                GROUP BY club_name
                                ORDER BY player_count DESC
                                LIMIT 5;`;
            let result = await pool.query(sqlPie);
            pieData = result.rows || [];

            const sqlLine = `SELECT ROUND(AVG(wage_eur)::NUMERIC, 2) AS average_wage_eur, overall
                            FROM ${year}
                            GROUP BY overall
                            ORDER BY overall DESC LIMIT 100`;
            result = await pool.query(sqlLine);
            lineData = result.rows || [];

            const sqlBar = `SELECT nationality_name, COUNT(*) AS player_count
                                FROM ${year}
                                GROUP BY nationality_name
                                ORDER BY player_count DESC
                                LIMIT 5; `;
            result = await pool.query(sqlBar);
            barData = result.rows || [];

            const sqlDoughnut = `SELECT club_position, COUNT(club_position) AS counts
                            FROM ${year}
                            WHERE club_position IS NOT NULL
                            GROUP BY club_position
                            ORDER BY counts DESC
                            LIMIT 10;`;
            result = await pool.query(sqlDoughnut);
            doughnutData = result.rows || [];

        } catch (error) {
            console.error('Error fetching data in /get-char:', error);
            dataPrevious = null; // กรณีไม่มีตารางของปีที่ลดลง
        }

        const responseData = { 
            pieData: pieData || [], 
            lineData: lineData || [], 
            barData: barData || [], 
            doughnutData: doughnutData || [] 
        };

        res.json(responseData); // ส่งข้อมูลกลับ
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).render('index', { data: [] });
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
