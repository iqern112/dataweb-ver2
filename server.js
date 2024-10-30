const express = require('express');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended:false}));

// การเชื่อมต่อฐานข้อมูล PostgreSQL
const pool = new Pool({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        ssl: {
            rejectUnauthorized: false
        }
});

// ฟังก์ชันสำหรับคิวรี่ข้อมูล nationality
async function querydata() {

}

// Endpoint to get dashboard data based on year
app.get('/api/dashboard-data/:year', async (req, res) => {
    const year = req.params.year;
    const fft = year.slice(-2);
    const tableName = `fifa${fft}`;

    const queries = {
        totalPlayers: `SELECT COUNT(*) AS totalPlayers FROM ${tableName}`,
        avgMaxOverallAge: `SELECT SUM(overall) AS sum_overall, COUNT(*) AS player_count FROM ${tableName}`,
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
        playerEachLevel: `SELECT league_level, COUNT(*) AS playerCount FROM ${tableName} GROUP BY league_level
                            ORDER BY league_level ASC`
    };
    
    try {
        const totalPlayersResult = await pool.query(queries.totalPlayers);
        const avgMaxOverallAgeResult = await pool.query(queries.avgMaxOverallAge);
        const currentYearComparisonResult = await queries.currentYearComparison();
        const teamsCountResult = await pool.query(queries.teamsCount);
        const playerEachLevelResult = await pool.query(queries.playerEachLevel);
    
        const dashboardData = {
            totalPlayers: totalPlayersResult.rows[0]?.totalplayers || 'N/A',
            avgMaxOverallAge: (avgMaxOverallAgeResult.rows[0]?.sum_overall / avgMaxOverallAgeResult.rows[0]?.player_count).toFixed(2) || 'N/A',
            currentYearComparison: `${currentYearComparisonResult.currentYear - currentYearComparisonResult.previousYear}`,
            teamsCount: teamsCountResult.rows[0]?.teamscount || 'N/A',
            playerEachLevel: playerEachLevelResult.rows.map(row => 
                `${row.league_level || 'No level'}: ${row.playercount || 0}`
            ).join(', ')
        };
        res.json(dashboardData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint to get player data based on year for initial display
app.get('/api/player-data/:year', async (req, res) => {
    const year = req.params.year;
    const tableName = `fifa${year}`;
    console.log(tableName)

    const columns = req.query.columns ? req.query.columns.split(',') : ['*'];
    const searchInput = req.query.searchInput || '';
    const position = req.query.position || '';
    const page = parseInt(req.query.page) || 1; // รับค่าหน้าปัจจุบัน
    const limit = 20; // จำนวนข้อมูลที่จะแสดงต่อหน้า
    const offset = (page - 1) * limit; // คำนวณ offset

    let query = `SELECT ${columns.join(', ')} FROM ${tableName} WHERE 1=1`;
    

    query += ` LIMIT ${limit} OFFSET ${offset}`; // เพิ่ม limit และ offset

    try {
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get("/api/searchPlayer", (req, res) => {
    const { query, year, columns } = req.query;
    const columnList = columns.split(",").join(", ");
    const sqlQuery = `
        SELECT ${columnList} FROM fifa${year}
        WHERE short_name ILIKE $1 OR long_name ILIKE $1;
    `;
    // console.log(`search/${year}`);

    pool.query(sqlQuery, [`%${query}%`], (error, results) => {
        if (error) {
            console.error("Error querying database:", error);
            res.status(500).send("Server Error");
        } else {
            res.json(results.rows);
        }
    });
});


// Route แสดงข้อมูลหน้าแรก
app.get('/', async (req, res) => {
    const data = await querydata();
    res.render('index', { data }); // ส่งข้อมูลไปยังหน้า index
});

// Route สำหรับดึงข้อมูล admin
app.get('/get-admins', async (req, res) => {
    try {
        const result = await pool.query("SELECT username, password FROM users ");
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving admin data");
    }
});

// Route สำหรับเพิ่ม admin
app.post('/add-admin', async (req, res) => {
    const { username, password } = req.body;

    try {
        await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password]);
        res.json({ message: "Admin added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error adding admin");
    }
});

// Route สำหรับลบ admin โดยใช้ username และ password
app.delete('/delete-admin', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query(
            "DELETE FROM users WHERE username = $1 AND password = $2 ",
            [username, password]
        );

        if (result.rowCount > 0) {
            res.json({ message: "Admin deleted successfully" });
        } else {
            res.status(404).json({ message: "Admin not found or credentials do not match" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting admin");
    }
});

app.get('/get-chart/:year', async (req, res) => {
    const year = req.params.year;
    const yearTable = `fifa${year}`
    try {
        let pieData;
        let lineData;
        let barData;
        let doughnutData;
        let radarData;
        let line2Data;

        try {
            const sqlPie = `SELECT preferred_foot, COUNT(*) AS player_count
                                FROM ${yearTable}
                                WHERE age IS NOT NULL
                                GROUP BY preferred_foot
                                ORDER BY player_count DESC
                                `;
            let result = await pool.query(sqlPie);
            pieData = result.rows || [];

            const sqlLine = `SELECT ROUND(AVG(wage_eur)::NUMERIC, 2) AS average_wage_eur, overall
                            FROM ${yearTable}
                            GROUP BY overall
                            ORDER BY overall DESC LIMIT 100`;
            result = await pool.query(sqlLine);
            lineData = result.rows || [];

            const sqlBar = `SELECT nationality_name, COUNT(*) AS player_count
                                FROM ${yearTable}
                                GROUP BY nationality_name
                                ORDER BY player_count DESC
                                LIMIT 5; `;
            result = await pool.query(sqlBar);
            barData = result.rows || [];

            const sqlDoughnut = `SELECT club_position, COUNT(club_position) AS counts
                            FROM ${yearTable}
                            WHERE club_position IS NOT NULL AND club_position NOT IN ('SUB','RES')
                            GROUP BY club_position
                            ORDER BY counts DESC
                            LIMIT 10;`;
            result = await pool.query(sqlDoughnut);
            doughnutData = result.rows || [];

            const sqlRadar = `SELECT preferred_foot,
                            ROUND(AVG(pace)::NUMERIC,2) AS avgpace,
                            ROUND(AVG(shooting)::NUMERIC,2) AS avgshoot,
                            ROUND(AVG(dribbling)::NUMERIC,2) AS avgdrib,
                            ROUND(AVG(physic)::NUMERIC,2) AS avgphysic,
                            ROUND(AVG(passing)::NUMERIC,2) AS avgpassing
                            FROM ${yearTable}
                            GROUP BY preferred_foot`;
            result = await pool.query(sqlRadar);
            radarData = result.rows || [];

            const sqlLine2 = `SELECT league_name, ROUND(AVG(height_cm)::NUMERIC,1) AS avgheight
                                , ROUND(AVG(weight_kg)::NUMERIC,1) AS avgweight
                                FROM ${yearTable}
                                WHERE league_name IN ('French Ligue 1','English Premier League',
                                'Italian Serie A','German 1. Bundesliga','Spain Primera Division')
                                GROUP BY league_name`;
            result = await pool.query(sqlLine2);
            line2Data = result.rows || [];

        } catch (error) {
            console.error('Error fetching data in /get-char:', error);
            dataPrevious = null;
        }

        const responseData = { 
            pieData: pieData || [], 
            lineData: lineData || [], 
            barData: barData || [], 
            doughnutData: doughnutData || [],
            radarData: radarData || [],
            line2Data : line2Data || []
        };
        res.json(responseData);
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
