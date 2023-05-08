// Constants
const FONT_REGULAR = "data/SchibstedGrotesk-Regular.ttf";
const FONT_BOLD = "data/SchibstedGrotesk-Bold.ttf"

// Variables
let dataUngrouped, dataGrouped;
let margin, height, rowHeight;
let athleteName, fencerCounts = {};
let colorOptions = {};
let radii;
let circles = [];
let filterOptions = {};
let checkboxes = [];
let tournamentTypes = [];
let tooltipDiv;
let fontBold, fontRegular;
let sceneNum = 0;

let overviewButton, matchupButton;
let selectFirstFencer, selectSecondFencer;

function preload() {
    dataUngrouped = loadJSON('data/ungrouped.json');
    print("JSON file loaded");

    fontRegular = loadFont(FONT_REGULAR);
    fontBold = loadFont(FONT_BOLD)
}


function setup() {

    /* -------------------------------------------------------------------------- */
    /*                                 PAGE SETUP                                 */
    /* -------------------------------------------------------------------------- */
    height = windowHeight * 3;
    createCanvas(windowWidth, height);

    /* ----------------------------- Color variables ---------------------------- */

    colorOptions = {
        grand_prix: { fill: color("#002d9cE6"), hover: color("#002d9c66") },
        world_cup: { fill: color("#009d9aE6"), hover: color("#009d9a66") },
        world_champs: { fill: color("#9f1853E6"), hover: color("#9f185366") },
        zone_champs: { fill: color("#570408E6"), hover: color("#57040866") },
        satellite: { fill: color("#a56effE6"), hover: color("#a56eff66") },
        misc: { fill: color("#ff7eb6E6"), hover: color("#ff7eb666") },
        olympics: { fill: color("#fa4d56E6"), hover: color("#fa4d5666") },
    };

    radii = { 'grand_prix': 25, 'world_cup': 35, 'world_champs': 40, 'zone_champs': 20, 'satellite': 15, 'misc': 15, 'olympics': 40 }

    margin = { top: 0.33 * windowHeight, right: 0.15 * windowWidth, bottom: 0.02 * windowHeight, left: 0.15 * windowWidth }


    /* -------------------------------------------------------------------------- */
    /*                               DATA WRANGLING                               */
    /* -------------------------------------------------------------------------- */
    dataGrouped = Object.values(dataUngrouped).reduce((acc, cur) => {
        const { name_y, season, name_x, country_x, start_date, type } = cur;
        acc[name_y] = acc[name_y] || { seasons: {} };
        acc[name_y].seasons[season] = acc[name_y].seasons[season] || { competitions: {} };
        acc[name_y].seasons[season].competitions[name_x] = {
            country: country_x,
            date: start_date,
            type: type
        };
        return acc;
    }, {});

    console.log(dataGrouped);

    /* ---------------------------- Sorting the data ---------------------------- */
    fencerCounts = Object.entries(dataGrouped).map(
        ([name, data]) => ({
            name: name,
            count: Object.keys(data.seasons)
                .map((season) => Object.keys(data.seasons[season].competitions).length)
                .reduce((a, b) => a + b, 0),
        })
    ).sort((a, b) => b.count - a.count);

    console.log(Object.values(fencerCounts));

    /* -------------------------------------------------------------------------- */
    /*                               FILTER BUTTONS                               */
    /* -------------------------------------------------------------------------- */

    tournamentTypes = ["world_champs", "olympics", "world_cup", "grand_prix", "zone_champs", "satellite", "misc"];

    filterOptions = {
        world_cup: true,
        grand_prix: true,
        olympics: true,
        world_champss: true,
        zone_champs: true,
        misc: true,
        satellite: true
    };
    let labelNames = [];

    let xPos = 0;
    let xposStart = margin.left + 250;



    for (let i = 0; i < tournamentTypes.length; i++) {
        let type = tournamentTypes[i];
        let labelName = type.split('_');
        if (labelName.length < 2) {
            labelName = labelName[0].charAt(0).toUpperCase() + labelName[0].slice(1) + ' Wins';
        } else {
            labelName = labelName[0].charAt(0).toUpperCase() + labelName[0].slice(1) + ' ' + labelName[1].charAt(0).toUpperCase() + labelName[1].slice(1) + ' Wins'
        }

        labelNames.push(labelName)

        console.log(labelName)

        let checkbox = createCheckbox(labelName, true);
        checkboxes.push(checkbox);
        let xStart = xposStart + 30
        checkbox.position(xPos + 75 * i + xStart, margin.top * 0.6);
        checkbox.class(type + " checkbox");
        checkbox.changed(() => {
            filterOptions[type] = checkbox.checked();
        });

        xPos += textWidth(labelNames[i]);


    }

    console.log(checkboxes)

    /* -------------------------------------------------------------------------- */
    /*                    CREATE DATASET WITH CIRCLE POSITIONS                    */
    /* -------------------------------------------------------------------------- */

    /* ---------------------------- Layout variables ---------------------------- */
    rowHeight = (height - margin.top) / fencerCounts.length;


    /* --------------------- Create circle positions array ---------------------- */
    for (let i = 0; i < fencerCounts.length; i++) {
        const { name: athlete } = fencerCounts[i];
        const [lastName, firstName] = athlete.split(' ');

        // Reformat the names of athletes for clarity
        const athleteName =
            firstName.length > 2 ?
                `${firstName.toLowerCase().charAt(0).toUpperCase()}${firstName.toLowerCase().slice(1)} ${lastName.toLowerCase().charAt(0).toUpperCase()}${lastName.toLowerCase().slice(1)}` :
                `${firstName} ${lastName}`;

        let athleteCircles = [];
        let xpos = xposStart;
        for (let season in dataGrouped[athlete].seasons) {
            for (let competition in dataGrouped[athlete].seasons[season].competitions) {
                let date = dataGrouped[athlete].seasons[season].competitions[competition].date;
                const date_parts = date.split('/');
                const competitionDate = new Date(20 + date_parts[2], date_parts[0] - 1, date_parts[1]).getTime();
                xpos = map(competitionDate, 1041397200000, 1672549200000, xposStart, windowWidth - margin.right);

                let type = dataGrouped[athlete].seasons[season].competitions[competition].type;
                let country = dataGrouped[athlete].seasons[season].competitions[competition].country;
                let ypos = rowHeight * i + margin.top;
                athleteCircles.push({ x: xpos, y: ypos, r: radii[type], fill: colorOptions[type].hover, type: type, competition: competition, date: date, country: country });
            }
        }
        circles.push({ name: athleteName, circles: athleteCircles })
    }

    console.log(circles)

    /* -------------------------------------------------------------------------- */
    /*                                  TOOLTIPS                                  */
    /* -------------------------------------------------------------------------- */
    tooltipDiv = createDiv('');
    tooltipDiv.class('tooltip');
    tooltipDiv.hide();

    /* -------------------------------------------------------------------------- */
    /*                               MATCHUP FILTERS                              */
    /* -------------------------------------------------------------------------- */
    // Create select element
    selectFirstFencer = createSelect();
    selectFirstFencer.position(margin.left + windowWidth * 0.15, margin.top * 0.7);
    selectFirstFencer.option('Select Fencer')
    selectFirstFencer.disable('Select Fencer')

    selectSecondFencer = createSelect();
    selectSecondFencer.position(windowWidth - margin.right - windowWidth * 0.25, margin.top * 0.7);
    selectSecondFencer.option('Select Fencer')
    selectSecondFencer.disable('Select Fencer')
    selectSecondFencer.option('Mariel Zagunis')
    selectSecondFencer.selected('Mariel Zagunis')

    // Add fencer names as options
    for (let i = 0; i < fencerCounts.length; i++) {
        const { name: athlete } = fencerCounts[i];
        const [lastName, firstName] = athlete.split(' ');

        // Reformat the names of athletes for clarity
        const athleteName =
            firstName.length > 2 ?
                `${firstName.toLowerCase().charAt(0).toUpperCase()}${firstName.toLowerCase().slice(1)} ${lastName.toLowerCase().charAt(0).toUpperCase()}${lastName.toLowerCase().slice(1)}` :
                `${firstName} ${lastName}`;
        selectFirstFencer.option(athleteName);
        selectSecondFencer.option(athleteName);
    }

    // Set event listener for select element
    selectFirstFencer.changed(displayFencerStats);
    selectSecondFencer.changed(displayFencerStats);

    /* -------------------------------------------------------------------------- */
    /*                                SWITCH SCENES                               */
    /* -------------------------------------------------------------------------- */
    overviewButton = createButton("Overview");
    overviewButton.position(windowWidth / 2 - 125, margin.top * 0.4);
    overviewButton.mousePressed(showOverview)

    matchupButton = createButton("Head to Head");
    matchupButton.position(windowWidth / 2, margin.top * 0.4);
    matchupButton.mousePressed(showMatchup);


}

function draw() {

    switch (sceneNum) {
        case 0:
            console.log("scene 0")
            background(255);
            textFont(fontRegular, 18);
            fill(0);
            noStroke();

            for (let i = 0; i < checkboxes.length; i++) {
                checkboxes[i].show();
            }

            selectFirstFencer.hide();
            selectSecondFencer.hide();

            matchupButton.class("");
            overviewButton.class("selected")
            /* -------------------------------------------------------------------------- */
            /*                         DRAWING TOURANMENT CIRCLES                         */
            /* -------------------------------------------------------------------------- */
            /* ------------------------------- Title text ------------------------------- */
            drawTitle()

            textSize(18)
            textAlign(LEFT, CENTER);

            /* ------------------ Add a timeline at the top of the page ----------------- */
            textAlign(CENTER, CENTER);
            fill(0);
            // horizontal line
            stroke("#a8a8a8");
            line(margin.left + 250, margin.top * 0.8, windowWidth - margin.right, margin.top * 0.8)
            for (let i = 2003; i <= 2023; i += 4) {
                let xPos = map(i, 2003, 2023, margin.left + 250, windowWidth - margin.right);
                stroke("#a8a8a8");
                line(xPos, margin.top * 0.78, xPos, margin.top * 0.82);
                noStroke();
                fill("#a8a8a8")
                text(i, xPos, margin.top * 0.85)
            }

            /* ----------------------------- Create dividers ---------------------------- */
            // // For title
            // line(40, 20, windowWidth - 40, 20)
            // line(40, margin.top * 0.3, windowWidth - 40, margin.top * 0.3)
            // For filters
            text("Filter by:", margin.left + 200, margin.top * 0.625)
            noFill()
            stroke("#a8a8a8");
            // rect(margin.left + 250, margin.top * 0.575, windowWidth - margin.left - margin.right - 250, margin.top * 0.1, 5)
            noStroke();

            /* ---------- Loop through each fencer and draw tournament circles ---------- */
            textAlign(LEFT, CENTER);
            for (let i = 0; i < circles.length; i++) {
                fill(0);
                noStroke();
                text(circles[i].name, margin.left, rowHeight * i + margin.top);

                for (let j = 0; j < circles[i].circles.length; j++) {
                    let circ = circles[i].circles[j];
                    fill(circ.fill);
                    stroke(circ.fill)
                    if (!filterOptions[circ.type]) {
                        continue;
                    }
                    circle(circ.x, circ.y, radii[circ.type]);
                }
            }

            /* -------------------------------- Tooltips -------------------------------- */
            textAlign(LEFT, CENTER)
            let hoveredCircle = null;
            for (let i = 0; i < circles.length; i++) {
                for (let j = 0; j < circles[i].circles.length; j++) {
                    let circ = circles[i].circles[j];
                    if (!filterOptions[circ.type]) {
                        continue;
                    }
                    let d = dist(mouseX, mouseY, circ.x, circ.y)
                    if (d < circ.r) {
                        hoveredCircle = circ;
                        break;
                    }
                }
            }

            if (hoveredCircle) {
                textStyle(BOLD)
                textSize(18)
                noStroke();
                fill(hoveredCircle.fill);
                rectMode(LEFT, CENTER)
                rect(mouseX, mouseY + 15, textWidth(hoveredCircle.date + " - " + hoveredCircle.competition) + 30, 35, 5);
                fill(255);
                textFont(fontBold)
                text(hoveredCircle.date + " - " + hoveredCircle.competition, mouseX + 10, mouseY + 30)
            }

            break;

        case 1:
            console.log("scene 1");
            background(255);

            for (let i = 0; i < checkboxes.length; i++) {
                checkboxes[i].hide();
            }

            selectFirstFencer.show();
            selectSecondFencer.show();

            textAlign(CENTER, CENTER)
            text("vs.", width / 2, margin.top * 0.7)

            matchupButton.class("selected");
            overviewButton.class("");

            /* ------------------------------- Title text ------------------------------- */
            drawTitle();

            break;

    }

}

function windowResized() {
    height = windowHeight * 3;
    resizeCanvas(windowWidth, height);
}

/* ------------------------------ Hover effects ----------------------------- */
function mouseMoved() {
    textAlign(LEFT, LEFT);
    fill(0);
    if (sceneNum == 0) {
        circles.forEach(fencer => {
            let isMouseOver = fencer.circles.some(circ => {
                let d = dist(mouseX, mouseY, circ.x, circ.y);
                return (d < circ.r || (mouseY < circ.y + 10 && mouseY > circ.y - 10 && mouseX > margin.left));
            });
            fencer.circles.forEach(circ => {
                circ.fill = isMouseOver ? colorOptions[circ.type].fill : colorOptions[circ.type].hover;
            });
        });
    }

}

function drawTitle() {
    textAlign(CENTER, CENTER);
    textFont(fontBold)
    textSize(32)
    text("The Short History of Women's Saber Fencing", windowWidth / 2, windowHeight * 0.05);
    textSize(20)
    text("2003 - 2023", windowWidth / 2, windowHeight * 0.085)
    textFont(fontRegular)
    noStroke();
    fill(0);
}


function showOverview() {
    sceneNum = 0;
}

function showMatchup() {
    sceneNum = 1;
}

function displayFencerStats() {
    // Get selected fencer name
    let selectedFencer = this.value();

    // Search fencers array for selected fencer
    for (let i = 0; i < fencers.length; i++) {
        if (fencers[i].name === selectedFencer) {
            // Display fencer stats
            textSize(20);
            text(fencers[i].name, 10, 50);
            textSize(16);
            text("Career Wins: " + fencers[i].wins, 10, 80);
            text("Career Losses: " + fencers[i].losses, 10, 100);
            text("Win Percentage: " + (fencers[i].wins / (fencers[i].wins + fencers[i].losses) * 100) + "%", 10, 120);
        }
    }
}