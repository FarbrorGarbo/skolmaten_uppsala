import fetch from "node-fetch";
import path from "path";
import * as fs from "fs";
import * as cheerio from "cheerio";

let dayName = "";
let todayHeading = "";

async function main() {
    // Fetch the page containing the weekly menu
    const url = "https://maltidsservice.uppsala.se/mat-och-menyer/grundskolans-meny/";
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    // Calculate todays date
    const now = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Europe/Stockholm" })
    );
    let today = now.toLocaleDateString("sv-SE", { weekday: "long" });
    let todaysMenu = "";
    let foundMenu = false;
    // console.log($.html());
console.log(today);
    $(".weeklymenu--dailymenu").each((_i, el) => {
        dayName = $(el).find(".weeklymenu--date").text().trim().toLowerCase();
console.log(dayName);
        if (dayName.includes(today)) {
            todayHeading = dayName;
            $(el).find("li").each((_j, li) => {
                const typeOfDish = $(li).find(".weeklymenu--typeofdish").text().trim();
                if (typeOfDish === "Dagens rätt" || typeOfDish === "Dagens alternativ") {
                    foundMenu = true;
                    todaysMenu += $(li).text().replace(typeOfDish, "").trim() + "\n";
                }
            });
        }
    });

    if (!todaysMenu) todaysMenu = "Ingen meny tillgänglig";

    const tomorrowDate = now;
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    // Tomorrow
    let tomorrow = tomorrowDate.toLocaleDateString("sv-SE", { weekday: "long" });
    let tomorrowsMenu = "Tomorrow: ";
    foundMenu = false;
    // console.log($.html());

    $(".weeklymenu--dailymenu").each((_i, el) => {
        dayName = $(el).find(".weeklymenu--date").text().trim().toLowerCase();

        if (dayName.includes(tomorrow)) {
            tomorrowsMenu += dayName + "\n";
            $(el).find("li").each((_j, li) => {
                const typeOfDish = $(li).find(".weeklymenu--typeofdish").text().trim();
                if (typeOfDish === "Dagens rätt" || typeOfDish === "Dagens alternativ") {
                    foundMenu = true;
                    tomorrowsMenu += $(li).text().replace(typeOfDish, "").trim() + "\n\n";
                }
            });
        }
    });

    if (!foundMenu) tomorrowsMenu += '\n\nIngen meny tillgänglig';

    const data = [
        {
            textbox: [10, 4, 366, 30, `Lunch: ${today}: ${todayHeading}`, "fonts/calibrib30", 2, 1.2]
        },
        {
            textbox: [10, 39, 366, 86, todaysMenu, "fonts/bahnschrift20", 1, 1.2]
        },
        {
            textbox: [10, 130, 366, 48, tomorrowsMenu, "fonts/tahoma11", 1, 1.2]
        }
    ];

    fs.writeFileSync("lunchuppsala.json", JSON.stringify(data, null, 2));
    console.log(data);
    // console.log("lunch.json genererad!");
}

main().catch(console.error);
