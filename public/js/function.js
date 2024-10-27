
function showLoginPopup() {
    document.getElementById('loginPopup').style.display = 'block';
}

function closePopup() {
    document.getElementById("loginPopup").style.display = "none";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
}

function logout() {
    document.getElementById("statusBtn").innerText = "Guest";
    document.getElementById("loginBtn").innerText = "Login";
    document.getElementById("loginBtn").onclick = showLoginPopup;
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    if (result.success) {
        document.getElementById("statusBtn").innerText = "Admin";
        document.getElementById("loginBtn").innerText = "Logout";
        document.getElementById("loginBtn").onclick = logout;
    } else {
        alert("เข้าสู่ระบบไม่สำเร็จ");
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
    }
    document.getElementById('loginPopup').style.display = 'none';
}

function fetchDataByYear() {
    const year = document.getElementById("yearSelect").value;
    fetch(`/data/${year}`)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("dataContainer");
            container.innerHTML = ""; // ล้างข้อมูลเก่า

            // สร้างตาราง
            const table = document.createElement("table");
            table.style.width = "100%";
            table.setAttribute("border", "1");
            table.setAttribute("cellpadding", "10");
            table.setAttribute("cellspacing", "0");

            // สร้างส่วนหัวของตาราง
            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
            const headers = [
                "sofifa_id", "short_name", "long_name", "player_positions", "overall",
                "potential", "value_eur", "wage_eur", "age", "height_cm",
                "weight_kg", "club_team_id", "club_name", "league_name", "league_level",
                "club_position", "club_jersey_number", "nationality_id", "nationality_name",
                "nation_position", "nation_jersey_number", "preferred_foot", "weak_foot",
                "skill_moves", "international_reputation", "work_rate", "release_clause_eur",
                "player_tags", "player_traits", "pace", "shooting", "passing", "dribbling",
                "defending", "physic", "attacking_crossing", "attacking_finishing",
                "attacking_heading_accuracy", "attacking_short_passing", "attacking_volleys",
                "skill_dribbling", "skill_curve", "skill_fk_accuracy", "skill_long_passing",
                "skill_ball_control", "movement_acceleration", "movement_sprint_speed",
                "movement_agility", "movement_reactions", "movement_balance", "power_shot_power",
                "power_jumping", "power_stamina", "power_strength", "power_long_shots",
                "mentality_aggression", "mentality_interceptions", "mentality_positioning",
                "mentality_vision", "mentality_penalties", "mentality_composure",
                "defending_marking_awareness", "defending_standing_tackle",
                "defending_sliding_tackle", "goalkeeping_diving", "goalkeeping_handling",
                "goalkeeping_kicking", "goalkeeping_positioning", "goalkeeping_reflexes",
                "goalkeeping_speed", "ls", "st", "rs", "lw", "lf", "cf", "rf", "rw",
                "lam", "cam", "ram", "lm", "lcm", "cm", "rcm", "rm", "lwb", "ldm", "cdm",
                "rdm", "rwb", "lb", "lcb", "cb", "rcb", "rb", "gk"
            ];

            headers.forEach(header => {
                const th = document.createElement("th");
                th.innerText = header;
                headerRow.appendChild(th);
            });

            thead.appendChild(headerRow);
            table.appendChild(thead);

            // สร้างส่วนตัวของตาราง
            const tbody = document.createElement("tbody");
            data.forEach(player => {
                const row = document.createElement("tr");
                headers.forEach(header => {
                    const td = document.createElement("td");
                    td.innerText = player[header];
                    row.appendChild(td);
                });
                tbody.appendChild(row);
            });

            table.appendChild(tbody);
            container.appendChild(table);
        })
        .catch(error => console.error('Error:', error));
}