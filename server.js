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
//khao
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});
//khao

// ฟังก์ชันสำหรับคิวรี่ข้อมูล nationality
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

// Endpoint to get dashboard data based on year
app.get('/api/dashboard-data/:year', async (req, res) => {
    const year = req.params.year;
    const fft = year.slice(-2);
    const tableName = `fifa${fft}`;

    const queries = {
        totalPlayers: `SELECT COUNT(*) AS totalPlayers FROM ${tableName}`,
        avgMaxOverallAge: `SELECT AVG(overall) AS avgMaxOverallAge FROM ${tableName} GROUP BY age ORDER BY avgMaxOverallAge DESC LIMIT 1`,
        currentYearComparison: async () => {
            const currentYearExists = await pool.query(`SELECT EXISTS (SELECT 1 FROM pg_catalog.pg_tables WHERE tablename = 'fifa${fft}')`);
            const previousYearExists = await pool.query(`SELECT EXISTS (SELECT 1 FROM pg_catalog.pg_tables WHERE tablename = 'fifa${fft - 1}')`);
            
            const currentYear = currentYearExists.rows[0].exists
                ? (await pool.query(`SELECT COUNT(*) FROM ${tableName}`)).rows[0].count
                : 'none';
            
            const previousYear = previousYearExists.rows[0].exists
                ? (await pool.query(`SELECT COUNT(*) FROM fifa${fft - 1}`)).rows[0].count
                : 'none';
    
            return { currentYear, previousYear };
        },
        teamsCount: `SELECT COUNT(DISTINCT club_name) AS teamsCount FROM ${tableName}`,
        playerEachLevel: `SELECT league_level, COUNT(*) AS playerCount FROM ${tableName} GROUP BY league_level`
    };
    
    try {
        const totalPlayersResult = await pool.query(queries.totalPlayers);
        const avgMaxOverallAgeResult = await pool.query(queries.avgMaxOverallAge);
        const currentYearComparisonResult = await queries.currentYearComparison();
        const teamsCountResult = await pool.query(queries.teamsCount);
        const playerEachLevelResult = await pool.query(queries.playerEachLevel);
    
        const dashboardData = {
            totalPlayers: totalPlayersResult.rows[0]?.totalplayers || 'N/A',
            avgMaxOverallAge: avgMaxOverallAgeResult.rows[0]?.avgmaxoverallage || 'N/A',
            currentYearComparison: currentYearComparisonResult.currentYear / currentYearComparisonResult.previousYear,
            teamsCount: teamsCountResult.rows[0]?.teamscount || 'N/A',
            playerEachLevel: playerEachLevelResult.rows.map(row => 
                `${row.league_level || 'No level'}: ${row.playercount || 0}`
            ).join(', ')
        };
        console.log(dashboardData);
        res.json(dashboardData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint to get player data based on year for initial display
app.get('/api/player-data/:year', async (req, res) => {
    const year = req.params.year;
    const fft = year.slice(-2);
    const tableName = `fifa${fft}`;

    const columns = req.query.columns ? req.query.columns.split(',') : ['*'];
    const searchInput = req.query.searchInput || '';
    const position = req.query.position || '';

    let query = `SELECT ${columns.join(', ')} FROM ${tableName} WHERE 1=1`;
    
    if (searchInput) {
        query += ` AND short_name ILIKE '%${searchInput}%'`;
    }

    if (position) {
        query += ` AND player_positions = '${position}'`;
    }

    query += ` LIMIT 20`;

    try {
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




// Route แสดงข้อมูลหน้าแรก
//khao
app.get('/', async (req, res) => {
    const data = await queryDatabase(); // คิวรีข้อมูล nationality
    res.render('index', { data }); // ส่งข้อมูลไปยังหน้า index
});
//khao

//khao
app.get('/dashboard/data/:year', async (req, res) => {
    const year = req.params.year;
    console.log(year, "/dashboard/data/:year")

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
