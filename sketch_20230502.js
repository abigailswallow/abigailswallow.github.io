let dataUngrouped, dataGrouped;
let margin, height, rowHeight;
let athleteName, fencerCounts = {};
// let button1, button2, button3, button4, button5;
let colA, colE, colC, colF, colB, colD, colG, hoverFills, noHoverFills;
let colAHover, colBHover, colCHover, colDHover, colEHover, colFHover;
let radii;
let circles = [];
let filterOptions = {};
let tournamentTypes = [];

function preload() {
    dataUngrouped = loadJSON('data/ungrouped.json');
    print("JSON file loaded");
}



function setup() {

    /* -------------------------------------------------------------------------- */
    /*                                 PAGE SETUP                                 */
    /* -------------------------------------------------------------------------- */
    height = windowHeight * 3;
    createCanvas(windowWidth, height);

    /* ----------------------------- Color variables ---------------------------- */

    colA = color("#002d9cE6");
    colB = color("#009d9aE6");
    colC = color("#9f1853E6");
    colD = color("#570408E6");
    colE = color("#a56effE6");
    colF = color("#ff7eb6E6");
    colG = color("#fa4d56E6");

    colAHover = color("#002d9c66");
    colBHover = color("#009d9a66");
    colCHover = color("#9f185366");
    colDHover = color("#57040866");
    colEHover = color("#a56eff66");
    colFHover = color("#ff7eb666");
    colGHover = color("#fa4d5666");

    hoverFills = { 'grand_prix': colA, 'world_cup': colB, 'world_champs': colC, 'zone_champs': colD, 'satellite': colE, 'misc': colF, 'olympics': colG };
    noHoverFills = { 'grand_prix': colAHover, 'world_cup': colBHover, 'world_champs': colCHover, 'zone_champs': colDHover, 'satellite': colEHover, 'misc': colFHover, 'olympics': colGHover };
    radii = { 'grand_prix': 25, 'world_cup': 35, 'world_champs': 40, 'zone_champs': 20, 'satellite': 15, 'misc': 15, 'olympics': 40 }

    margin = { top: 0.25 * windowHeight, right: 0.15 * windowWidth, bottom: 0.02 * windowHeight, left: 0.15 * windowWidth }


    /* -------------------------------------------------------------------------- */
    /*                               DATA WRANGLING                               */
    /* -------------------------------------------------------------------------- */

    dataGrouped = Object.values(dataUngrouped).reduce((acc, cur) => {
        // Group data by name_y
        if (!acc[cur.name_y]) {
            acc[cur.name_y] = { seasons: {} };
        }

        // Group data by season
        if (!acc[cur.name_y].seasons[cur.season]) {
            acc[cur.name_y].seasons[cur.season] = { competitions: {} };
        }

        // Group data by competition name
        if (!acc[cur.name_y].seasons[cur.season].competitions[cur.name_x]) {
            acc[cur.name_y].seasons[cur.season].competitions[cur.name_x] = {};
        }

        // Add competition information to the competition name
        acc[cur.name_y].seasons[cur.season].competitions[cur.name_x] = {
            country: cur.country_x,
            date: cur.start_date,
            type: cur.type
        };

        return acc;
    }, {});

    console.log(dataGrouped);

    tournamentTypes = ["world_cup", "grand_prix", "misc", "zone_champs", "world_champs", "olympics", "satellite"]

    /* ---------------------------- Sorting the data ---------------------------- */
    fencerCounts = Object.entries(dataGrouped).map(([name, data]) => {
        let count = 0;
        for (let season in data.seasons) {
            count += Object.keys(data.seasons[season].competitions).length;
        }
        return { name: name, count: count };
    });

    fencerCounts.sort((a, b) => b.count - a.count);

    console.log(Object.values(fencerCounts))

    /* -------------------------------------------------------------------------- */
    /*                               FILTER BUTTONS                               */
    /* -------------------------------------------------------------------------- */
    filterOptions = {
        world_cup: true,
        grand_prix: true,
        olympics: true,
        world_champss: true,
        zone_champs: true,
        misc: true,
        satellite: true
    };

    for (let i = 0; i < tournamentTypes.length; i++) {
        let type = tournamentTypes[i];
        let checkbox = createCheckbox(type, true);
        checkbox.position(width/2 - 300 + 120*i, margin.top / 2);
        checkbox.class(type)
        checkbox.changed(() => {
            filterOptions[type] = checkbox.checked();
        });
    }

    /* -------------------------------------------------------------------------- */
    /*                    CREATE DATASET WITH CIRCLE POSITIONS                    */
    /* -------------------------------------------------------------------------- */

    /* ---------------------------- Layout variables ---------------------------- */
    rowHeight = (height - margin.top) / fencerCounts.length;
    let xposStart = margin.left + 250;

    /* --------------------- Create circle positions array ---------------------- */
    for (let i = 0; i < fencerCounts.length; i++) {
        athlete = fencerCounts[i].name;

        // Reformat the names of athletes for clarity
        athleteName = athlete.split(' ');
        if (athleteName.length > 2) {
            athleteName = athleteName.slice(-1) + " " + athleteName[0].toLowerCase().charAt(0).toUpperCase() + athleteName[0].toLowerCase().slice(1);
        } else {
            athleteName = athleteName[1] + " " + athleteName[0].toLowerCase().charAt(0).toUpperCase() + athleteName[0].toLowerCase().slice(1);
        }

        let athleteCircles = [];
        let xpos = xposStart;
        for (let season in dataGrouped[athlete].seasons) {
            for (let competition in dataGrouped[athlete].seasons[season].competitions) {
                let date = dataGrouped[athlete].seasons[season].competitions[competition].date;
                const date_parts = date.split('/');
                const competitionDate = new Date(20 + date_parts[2], date_parts[0] - 1, date_parts[1]).getTime();
                xpos = map(competitionDate, 1041397200000, 1672549200000, xposStart, windowWidth - margin.right);

                let type = dataGrouped[athlete].seasons[season].competitions[competition].type;
                let ypos = rowHeight * i + margin.top;
                athleteCircles.push({ x: xpos, y: ypos, r: radii[type], fill: noHoverFills[type], type: type, competition: competition, date: date });
            }
        }
        circles.push({ name: athleteName, circles: athleteCircles })
    }

    console.log(circles)

}

function draw() {
    background(255);
    textSize(18);
    fill(0);
    noStroke();
    /* -------------------------------------------------------------------------- */
    /*                         DRAWING TOURANMENT CIRCLES                         */
    /* -------------------------------------------------------------------------- */
    /* ------------------------------- Title text ------------------------------- */
    textAlign(CENTER, CENTER);
    textStyle(BOLD)
    textSize(32)
    text("The History of Women's Saber Fencing", windowWidth / 2, windowHeight * 0.05);
    textSize(20)
    text("2003 - 2023", windowWidth / 2, windowHeight * 0.072)
    textStyle(NORMAL)
    noStroke();
    fill(0);

    textSize(18)
    textAlign(LEFT, CENTER);

    /* ---------- Loop through each fencer and draw tournament circles ---------- */
    for (let i = 0; i < circles.length; i++) {
        fill(0);
        text(circles[i].name, margin.left, rowHeight * i + margin.top);

        for (let j = 0; j < circles[i].circles.length; j++) {
            let circ = circles[i].circles[j];
            fill(circ.fill);
            if (!filterOptions[circ.type]) {
                continue;
            }
            circle(circ.x, circ.y, radii[circ.type]);
        }
    }

    /* ------------------ Add a timeline at the top of the page ----------------- */
    textAlign(CENTER);
    fill(0);
    // horizontal line
    stroke("#a8a8a8");
    line(margin.left + 250, margin.top * 0.6, windowWidth - margin.right, margin.top * 0.6)
    for (let i = 2003; i <= 2023; i += 4) {
        let xPos = map(i, 2003, 2023, margin.left + 250, windowWidth - margin.right);
        stroke("#a8a8a8");
        line(xPos, margin.top * 0.55, xPos, margin.top * 0.65);
        noStroke();
        fill("#a8a8a8")
        text(i, xPos, margin.top - 50)
    }
}

function windowResized() {
    height = windowHeight * 3;
    resizeCanvas(windowWidth, height);
}

/* ------------------------------ Hover effects ----------------------------- */

function mouseMoved() {
    for (let i = 0; i < circles.length; i++) {

        // Check if the mouse is over any of the circles for this fencer
        let isMouseOver = false;
        for (let j = 0; j < circles[i].circles.length; j++) {
            let circ = circles[i].circles[j];
            let d = dist(mouseX, mouseY, circ.x, circ.y);
            if (d < circ.r || mouseY < circ.y + 10 && mouseY > circ.y - 10) {
                isMouseOver = true;
                textAlign(LEFT, LEFT)
                fill(0)
                break;
            }
        }

        // If the mouse is over any of the circles for this fencer, change the fill color of all the circles for this fencer
        if (isMouseOver) {
            for (let j = 0; j < circles[i].circles.length; j++) {
                let circ = circles[i].circles[j];
                circ.fill = hoverFills[circ.type];
            }
        } else {
            // If the mouse is not over any of the circles for this fencer, change the fill color of all the circles back to their original color
            for (let j = 0; j < circles[i].circles.length; j++) {
                let circ = circles[i].circles[j];
                circ.fill = noHoverFills[circ.type];
            }
        }
    }

}
