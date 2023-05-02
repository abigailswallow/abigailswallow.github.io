let data_ungrouped, data_grouped, fencers;
let margin, height;
let athlete;
let button1, button2, button3, button4, button5;
let blue, green, red, yellow, orange, teal, fill_dict;

function preload() {
    data_ungrouped = loadJSON('data/ungrouped.json');
    print("JSON file loaded");
}



function setup() {

    /* -------------------------------------------------------------------------- */
    /*                                 PAGE SETUP                                 */
    /* -------------------------------------------------------------------------- */
    height = windowHeight * 3
    createCanvas(windowWidth, height);

    blue = color("#5778a4")
    orange = color("#e49444")
    red = color("#d1615d")
    teal = color("#85b6b2")
    green = color("#6a9f58")
    yellow = color("#e7ca60");

    fill_dict = { 'grand_prix': blue, 'world_cup': orange, 'world_champs': red, 'zone_champs': teal, 'satellite': green, 'misc': yellow };

    /* -------------------------------------------------------------------------- */
    /*                               DATA WRANGLING                               */
    /* -------------------------------------------------------------------------- */

    data_grouped = Object.values(data_ungrouped).reduce((acc, cur) => {
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

        // Add competition information to the competition title
        acc[cur.name_y].seasons[cur.season].competitions[cur.name_x] = {
            country: cur.country_x,
            date: cur.start_date,
            type: cur.type
        };

        return acc;
    }, {});

    fencers = Object.keys(data_grouped);

    console.log(data_grouped);
    // console.log(fencers);

    /* ---------------------------- Sorting the data ---------------------------- */

    /* -------------------------------------------------------------------------- */
    /*                               FILTER BUTTONS                               */
    /* -------------------------------------------------------------------------- */
    let button_width = 170;
    // create button1
    button1 = createButton('Total Wins');
    button1.position(width / 2 - button_width*2, windowHeight - 100);

    // create button2
    button2 = createButton('Olympic Wins');
    button2.position(width / 2 - button_width, windowHeight - 100);

    // create button3
    button3 = createButton('World Cup Wins');
    button3.position(width / 2, windowHeight - 100);
    button3.style("color", fill_dict['world_cup'])
    // create button4
    button4 = createButton('Grand Prix Wins');
    button4.position(width / 2 + button_width, windowHeight - 100);
    button4.style("color", fill_dict['grand_prix'])
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
    margin = { top: 0.15 * windowHeight, right: 0.02 * windowWidth, bottom: 0.02 * windowHeight, left: 0.02 * windowWidth }
    let fencer_height = height / fencers.length;
    let x_pos_start = margin.left + 250;
    let r = 25;
    // console.log(fencer_height)

    /* ---------- Loop through each fencer and draw tournament circles ---------- */
    textAlign(LEFT);
    // title
    textStyle(BOLD)
    text("Who is the G.O.A.T of Women's Saber Fencing?", margin.left, windowHeight * 0.05)
    textStyle(NORMAL)

    for (let i = 0; i < fencers.length; i++) {
        athlete = fencers[i];
        fill(0);
        text(athlete, margin.left, fencer_height * i + margin.top);

        let x_pos = x_pos_start;
        for (let season in data_grouped[athlete].seasons) {
            for (let competition in data_grouped[athlete].seasons[season].competitions) {
                let date = data_grouped[athlete].seasons[season].competitions[competition].date;
                const date_parts = date.split('/');
                const competitionDate = new Date(20 + date_parts[2], date_parts[0] - 1, date_parts[1]).getFullYear();
                x_pos = map(competitionDate, 2003, 2023, x_pos_start, windowWidth - margin.right);
                fill(fill_dict[data_grouped[athlete].seasons[season].competitions[competition].type])
                ellipse(x_pos, fencer_height * i + margin.top, r, r);
            }
        }
    }

    /* ------------------ Add a timeline at the top of the page ----------------- */
    textAlign(CENTER);
    fill(0);
    // horizontal line
    stroke(0);
    line(x_pos_start, margin.top * 0.6, windowWidth - margin.right, margin.top * 0.6)
    for (let i = 2003; i <= 2023; i += 4) {
        let xPos = map(i, 2003, 2023, x_pos_start, windowWidth - margin.right);
        stroke(0);
        line(xPos, margin.top * 0.55, xPos, margin.top * 0.65);
        noStroke();
        text(i, xPos, margin.top - 25)
    }
}

function windowResized() {
    resizeCanvas(windowWidth, height);
}
