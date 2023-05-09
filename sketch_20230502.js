// Constants
const FONT_REGULAR = "data/SchibstedGrotesk-Regular.ttf";
const FONT_BOLD = "data/SchibstedGrotesk-Bold.ttf"

// Variables
let dataUngrouped, dataGrouped;
let dataRanks, ranksGrouped = {};
let margin, height, rowHeight;
let athleteName, fencerCounts = {}, fencerNames = [];
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
let selectFencerA, selectFencerB;
let fencerA, fencerB;
let statsA, statsB;

let fencerAOlympicWins = 0;
let fencerBOlympicWins = 0;
let olympicWins = {}, worldCupWins = {}, worldChampWins = {};

function preload() {
    dataUngrouped = loadJSON('data/ungrouped.json');
    dataRanks = loadJSON('data/ranks.json')
    print("JSON files loaded");

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

    // Main dataset
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

    // Rankings dataset
    for (let fencerId in dataRanks) {
        let fencer = dataRanks[fencerId]; // grab the fencer by id

        // reformat name
        const [lastName, firstName] = fencer.name.split(' ');
        let name =
            firstName.length > 2 ?
                `${firstName.toLowerCase().charAt(0).toUpperCase()}${firstName.toLowerCase().slice(1)} ${lastName.toLowerCase().charAt(0).toUpperCase()}${lastName.toLowerCase().slice(1)}` :
                `${firstName} ${lastName}`;

        // create an object to hold fencer data
        if (!ranksGrouped[name]) {
            ranksGrouped[name] = {
                hand: fencer.hand,
                age: fencer.age,
                country: fencer.country,
                seasons: {}
            }
        }

        let season = fencer["season"].split('/')[0];

        // add season data 
        ranksGrouped[name].seasons[season] = {
            points: fencer.points,
            rank: fencer.rank
        }
    }

    console.log(ranksGrouped)

    /* ---------------------------- Sorting the data ---------------------------- */
    fencerCounts = Object.entries(dataGrouped).map(
        ([name, data]) => ({
            name: name,
            count: Object.keys(data.seasons)
                .map((season) => Object.keys(data.seasons[season].competitions).length)
                .reduce((a, b) => a + b, 0),
        })
    ).sort((a, b) => b.count - a.count);

    // console.log(Object.values(fencerCounts));

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

        // console.log(labelName)

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

    // console.log(checkboxes)

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

    // console.log(circles)

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
    selectFencerA = createSelect();
    selectFencerA.position(margin.left + windowWidth * 0.15, margin.top * 0.7);
    selectFencerA.option('Select Fencer')
    selectFencerA.disable('Select Fencer')

    selectFencerB = createSelect();
    selectFencerB.position(windowWidth - margin.right - windowWidth * 0.25, margin.top * 0.7);
    selectFencerB.option('Select Fencer')
    selectFencerB.disable('Select Fencer')
    selectFencerB.option('Mariel Zagunis')
    selectFencerB.selected('Mariel Zagunis')

    // Add fencer names as options
    for (let i = 0; i < fencerCounts.length; i++) {
        const { name: athlete } = fencerCounts[i];
        const [lastName, firstName] = athlete.split(' ');

        // Reformat the names of athletes for clarity
        const athleteName =
            firstName.length > 2 ?
                `${firstName.toLowerCase().charAt(0).toUpperCase()}${firstName.toLowerCase().slice(1)} ${lastName.toLowerCase().charAt(0).toUpperCase()}${lastName.toLowerCase().slice(1)}` :
                `${firstName} ${lastName}`;
        selectFencerA.option(athleteName);
        selectFencerB.option(athleteName);
        fencerNames.push(athleteName);
    }

    fencerA = fencerNames[0];
    fencerB = fencerNames[1];
    updateStats();

    /* -------------------------------------------------------------------------- */
    /*                                    STATS                                   */
    /* -------------------------------------------------------------------------- */

    // tallying wins
    for (let i = 0; i < circles.length; i++) {
        for (let j = 0; j < circles[i].circles.length; j++) {
            let circ = circles[i].circles[j];
            let name = circles[i].name;

            let fencerName = `${name.split(" ")[0]} ${name.split(" ")[1]}`; // convert name to "First Last" format

            // olympics
            if (!olympicWins[fencerName]) {
                olympicWins[fencerName] = 0;
            }
            if (circ.type === "olympics") {
                olympicWins[fencerName]++;
            }

            // world cups
            if (!worldCupWins[fencerName]) {
                worldCupWins[fencerName] = 0;
            }
            if (circ.type === "world_cup") {
                worldCupWins[fencerName]++;
            }

            // world champs
            if (!worldChampWins[fencerName]) {
                worldChampWins[fencerName] = 0;
            }
            if (circ.type === "world_champs") {
                worldChampWins[fencerName]++;
            }
        }
    }

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
            enableScroll();
            // console.log("scene 0")
            background(255);
            textFont(fontRegular, 18);
            fill(0);
            noStroke();

            for (let i = 0; i < checkboxes.length; i++) {
                checkboxes[i].show();
            }

            selectFencerA.hide();
            selectFencerB.hide();

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
            // console.log("scene 1");
            background(255);
            disableScroll();

            /* ------------------------------ Reset styles ------------------------------ */

            for (let i = 0; i < checkboxes.length; i++) {
                checkboxes[i].hide();
            }

            selectFencerA.show();
            selectFencerB.show();

            textAlign(CENTER, CENTER)
            text("vs.", width / 2, margin.top * 0.7)

            matchupButton.class("selected");
            overviewButton.class("");

            /* ------------------------------- Title text ------------------------------- */
            noStroke();
            fill(0);
            drawTitle();

            /* -------------------- Update stats beased on selection -------------------- */
            selectFencerA.changed(updateFencerA);
            selectFencerB.changed(updateFencerB);

            let fencerAData = ranksGrouped[fencerA];
            let fencerBData = ranksGrouped[fencerB];

            let left = margin.left + windowWidth * 0.15;
            let right = windowWidth - margin.right - windowWidth * 0.25;
            let top = margin.top * 0.84;
            let spacing = 35

            /* ----------------------------------- Bio ---------------------------------- */

            textAlign(LEFT, CENTER);
            text(fencerAData.country.toLowerCase().charAt(0).toUpperCase() + fencerAData.country.toLowerCase().slice(1), left, top);
            text("Hand: " + fencerAData.hand, left, top + spacing);
            text(fencerAData.age + " years old", left, top + spacing * 2)

            text(fencerBData.country.toLowerCase().charAt(0).toUpperCase() + fencerBData.country.toLowerCase().slice(1), right, top);
            text("Hand: " + fencerBData.hand, right, top + spacing);
            text(fencerBData.age + " years old", right, top + spacing * 2);

            /* ------------------------------ Ranking graph ----------------------------- */
            textAlign(CENTER, CENTER)
            textFont(fontBold)
            text("Career Rankings", windowWidth / 2, top + spacing * 3.5)
            text("Rank", left - 40, windowHeight * 0.54);
            textFont(fontRegular);
            textSize(14)
            textAlign(RIGHT, CENTER)
            text("1", left - 10, top + spacing * 5);
            text("500", left - 10, windowHeight * 0.64);
            // draw the data for fencer1
            noFill();
            strokeWeight(4);

            textSize(20)

            let fencerARankings = fencerAData.seasons;
            let keysA = Object.keys(fencerARankings);
            let fencerBRankings = fencerBData.seasons;
            let keysB = Object.keys(fencerBRankings);

            let widthPercent = 0.3 * windowWidth;
            let heightPercent = 0.5 * windowHeight;


            // fencerA
            beginShape();
            stroke(colorOptions["olympics"].fill)
            for (let i = 0; i < keysA.length; i++) {
                let x = map(Number(keysA[i]), 2003, 2023, widthPercent, windowWidth - widthPercent);
                let y = map(fencerARankings[keysA[i]].rank, 1, 450, top + spacing * 5, windowHeight * 0.6);
                vertex(x, y);
            }
            endShape();


            // fencerB
            beginShape();
            stroke(colorOptions["world_cup"].fill)
            for (let i = 0; i < keysB.length; i++) {
                let x = map(Number(keysB[i]), 2003, 2023, widthPercent, windowWidth - widthPercent);
                let y = map(fencerBRankings[keysB[i]].rank, 1, 450, top + spacing * 5, windowHeight * 0.6);
                vertex(x, y);
            }
            endShape();

            noStroke();
            fill(colorOptions["olympics"].fill)
            circle(margin.left + windowWidth * 0.14, margin.top * 0.75, 20);
            fill(colorOptions["world_cup"].fill)
            circle(windowWidth - margin.right - windowWidth * 0.26, margin.top * 0.75, 20);
            strokeWeight(1);
            stroke(0);

            // draw axes
            // x axis
            line(widthPercent, windowHeight * 0.65, windowWidth - widthPercent, windowHeight * 0.65);
            // y axis
            line(widthPercent, top + spacing * 4.5, widthPercent, windowHeight * 0.65);

            // draw x-axis tick marks
            for (let year = 2003; year <= 2023; year += 5) {
                let x = map(year, 2003, 2023, widthPercent, windowWidth - widthPercent);
                stroke(0);
                line(x, windowHeight * 0.645, x, windowHeight * 0.655);
                noStroke();
                textAlign(CENTER, TOP);
                fill(0);
                text(year, x, windowHeight * 0.65 + 10);
            }

            noStroke();

            /* ----------------------------- Stats breakdown ---------------------------- */
            textFont(fontBold);
            textAlign(CENTER, CENTER)
            text("Head-to-Head Stats", windowWidth / 2, windowHeight * 0.72);
            text(fencerA, windowWidth / 2 - 150, windowHeight * 0.75)
            text(fencerB, windowWidth / 2 + 150, windowHeight * 0.75)

            let statsTop = windowHeight * 0.8;
            let statsHeight = (windowHeight - statsTop) / 4
            stroke(180);
            line(width / 2, windowHeight * 0.735, width / 2, windowHeight);
            line(windowWidth/2 - 450, windowHeight * 0.735, windowWidth/2 + 450, windowHeight * 0.735);
            line(windowWidth/2 - 450, windowHeight * 0.77, windowWidth/2 + 450, windowHeight * 0.77);

            textAlign(LEFT, CENTER);
            textFont(fontRegular, 18);
            noStroke();
            fill(100);

            // Career ranking
            text("Career High Ranking", left - 50, statsTop);
            let rankA = 999;
            for (let i = 0; i < keysA.length; i++) {
                let rank = Number(fencerARankings[keysA[i]].rank);
                if (rank < rankA) {
                    rankA = rank;
                }
            }

            let rankB = 999;
            for (let i = 0; i < keysB.length; i++) {
                let rank = Number(fencerBRankings[keysB[i]].rank);
                if (rank < rankB) {
                    rankB = rank;
                }
            }

            fill(colorOptions['olympics'].fill)
            drawStatsRect(windowWidth / 2 - 125, statsTop)
            fill(255)
            text(rankA, windowWidth / 2 - 125, statsTop)

            fill(colorOptions['world_cup'].fill)
            drawStatsRect(windowWidth / 2 + 140, statsTop)
            fill(255)
            text(rankB, windowWidth / 2 + 140, statsTop)


            // Olympic medals
            fill(100)
            text("Olympic Gold Medals", left - 50, statsTop + statsHeight);

            fill(colorOptions['olympics'].fill)
            drawStatsRect(windowWidth / 2 - 125, statsTop + statsHeight)
            fill(255)
            text(olympicWins[fencerA], windowWidth / 2 - 125, statsTop + statsHeight)

            fill(colorOptions['world_cup'].fill)
            drawStatsRect(windowWidth / 2 + 140, statsTop + statsHeight)
            fill(255)
            text(olympicWins[fencerB], windowWidth / 2 + 140, statsTop + statsHeight)

            // World Championships
            fill(100)
            text("World Championships", left - 50, statsTop + statsHeight * 2);

            fill(colorOptions['olympics'].fill)
            drawStatsRect(windowWidth / 2 - 125, statsTop + statsHeight * 2)
            fill(255)
            text(worldChampWins[fencerA], windowWidth / 2 - 125, statsTop + statsHeight * 2)

            fill(colorOptions['world_cup'].fill)
            drawStatsRect(windowWidth / 2 + 140, statsTop + statsHeight * 2)
            fill(255)
            text(worldChampWins[fencerB], windowWidth / 2 + 140, statsTop + statsHeight * 2)

            // World Cups
            fill(100)
            text("World Cup Wins", left - 50, statsTop + statsHeight * 3);

            fill(colorOptions['olympics'].fill)
            drawStatsRect(windowWidth / 2 - 125, statsTop + statsHeight * 3)
            fill(255)
            text(worldCupWins[fencerA], windowWidth / 2 - 125, statsTop + statsHeight * 3)

            fill(colorOptions['world_cup'].fill)
            drawStatsRect(windowWidth / 2 + 140, statsTop + statsHeight * 3)
            fill(255)
            text(worldCupWins[fencerB], windowWidth / 2 + 140, statsTop + statsHeight * 3)


            textAlign(LEFT, CENTER)
            rectMode(CORNER)
            fill(0);
            break;

    }

}

function windowResized() {
    height = windowHeight * 3;
    resizeCanvas(windowWidth, height);
}

/* ------------------------------ Hover effects ----------------------------- */


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


function showOverview() {
    sceneNum = 0;
}

function showMatchup() {
    sceneNum = 1;
}

function updateFencerA() {
    fencerA = this.value();
    updateStats();
}

function updateFencerB() {
    fencerB = this.value();
    updateStats();
}

function updateStats() {
    statsA = ranksGrouped[fencerA];
    statsB = ranksGrouped[fencerB];
}

function drawStatsRect(x, y) {
    rectMode(CENTER, CENTER)
    rect(x, y, 200, 40, 10)
}

function disableScroll() {
    // Get the current page scroll position
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,

        // if any scroll is attempted, set this to the previous value
        window.onscroll = function () {
            window.scrollTo(scrollLeft, scrollTop);
        };
}



function enableScroll() {
    window.onscroll = function () { };
}