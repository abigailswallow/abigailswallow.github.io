let dataUngrouped, dataGrouped, fencers;
let margin, height, rowHeight;
let athlete, fencerCounts;
let button1, button2, button3, button4, button5;
let blue, green, red, yellow, orange, teal, hoverFills;
let radii;

function preload() {
    dataUngrouped = loadJSON('data/ungrouped.json');
    print("JSON file loaded");
}



function setup() {

    /* -------------------------------------------------------------------------- */
    /*                                 PAGE SETUP                                 */
    /* -------------------------------------------------------------------------- */
    height = windowHeight * 3
    createCanvas(windowWidth, height);

    /* ----------------------------- Color variables ---------------------------- */

    blue = color("#5778a4CC");
    orange = color("#e49444CC");
    red = color("#d1615dCC");
    teal = color("#85b6b2CC");
    green = color("#6a9f58CC");
    yellow = color("#e7ca60CC");

    blueHover = color("#818ea1CC");
    orangeHover = color("#e8c5a2CC");
    redHover = color("#d19d9bCC");
    tealHover = color("#9ab3b0CC");
    greenHover = color("#879981CC");
    yellowHover = color("#e3d5a1CC");

    hoverFills = { 'grand_prix': blue, 'world_cup': orange, 'world_champs': red, 'zone_champs': teal, 'satellite': green, 'misc': yellow };
    noHoverFills = { 'grand_prix': blueHover, 'world_cup': orangeHover, 'world_champs': redHover, 'zone_champs': tealHover, 'satellite': greenHover, 'misc': yellowHover };
    radii = {'grand_prix': 25, 'world_cup': 35, 'world_champs': 40, 'zone_champs': 20, 'satellite': 15, 'misc': 15 }


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

    fencers = Object.keys(dataGrouped);
    console.log(dataGrouped)

    // console.log(fencers);

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
    // let button_width = 170;
    // // create button1
    // button1 = createButton('Total Wins');
    // button1.position(width / 2 - button_width * 2, windowHeight - 100);

    // // create button2
    // button2 = createButton('Olympic Wins');
    // button2.position(width / 2 - button_width, windowHeight - 100);

    // // create button3
    // button3 = createButton('World Cup Wins');
    // button3.position(width / 2, windowHeight - 100);
    // button3.style("color", hoverFills['world_cup'])
    // // create button4
    // button4 = createButton('Grand Prix Wins');
    // button4.position(width / 2 + button_width, windowHeight - 100);
    // button4.style("color", hoverFills['grand_prix'])
}

function draw() {
    background(255);
    textSize(18);
    fill(0);
    noStroke();
    /* -------------------------------------------------------------------------- */
    /*                         DRAWING TOURANMENT CIRCLES                         */
    /* -------------------------------------------------------------------------- */

    /* ---------------------------- Layout variables ---------------------------- */
    margin = { top: 0.15 * windowHeight, right: 0.04 * windowWidth, bottom: 0.02 * windowHeight, left: 0.04 * windowWidth }
    rowHeight = (height - margin.top) / fencers.length;
    let xposStart = margin.left + 250;
    let r = 20;
    // console.log(rowHeight)

    /* ---------- Loop through each fencer and draw tournament circles ---------- */
    textAlign(LEFT, CENTER);
    // title
    textStyle(BOLD)
    text("Who is the G.O.A.T of Women's Saber Fencing?", margin.left, windowHeight * 0.05)
    textStyle(NORMAL)

    for (let i = 0; i < fencerCounts.length; i++) {

        noStroke();
        athlete = fencerCounts[i].name;
        fill(0);

        let athleteName = athlete.split(' ');
        if (athleteName.length > 2) {
            athleteName = athleteName.slice(-1) + " " + athleteName[0].toLowerCase().charAt(0).toUpperCase() + athleteName[0].toLowerCase().slice(1);
        } else {
            athleteName = athleteName[1] + " " + athleteName[0].toLowerCase().charAt(0).toUpperCase() + athleteName[0].toLowerCase().slice(1);
        }

        text(athleteName, margin.left, rowHeight * i + margin.top);

        let xpos = xposStart;
        for (let season in dataGrouped[athlete].seasons) {
            for (let competition in dataGrouped[athlete].seasons[season].competitions) {
                let date = dataGrouped[athlete].seasons[season].competitions[competition].date;
                const date_parts = date.split('/');
                const competitionDate = new Date(20 + date_parts[2], date_parts[0] - 1, date_parts[1]).getTime();
                xpos = map(competitionDate, 1041397200000, 1672549200000, xposStart, windowWidth - margin.right);

                let type = dataGrouped[athlete].seasons[season].competitions[competition].type
                fill(hoverFills[type]);

                circle(xpos, rowHeight * i + margin.top, radii[type]);
            }
        }

    }

    /* ------------------ Add a timeline at the top of the page ----------------- */
    textAlign(CENTER);
    fill(0);
    // horizontal line
    stroke(0);
    line(xposStart, margin.top * 0.6, windowWidth - margin.right, margin.top * 0.6)
    for (let i = 2003; i <= 2023; i += 4) {
        let xPos = map(i, 2003, 2023, xposStart, windowWidth - margin.right);
        stroke(0);
        line(xPos, margin.top * 0.55, xPos, margin.top * 0.65);
        noStroke();
        text(i, xPos, margin.top - 25)
    }
}

function windowResized() {
    resizeCanvas(windowWidth, height);
}

/* ------------------------------ Hover effects ----------------------------- */

