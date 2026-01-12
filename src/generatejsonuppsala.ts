import fetch from "node-fetch";
import he from "he";
import * as fs from "fs";
import * as cheerio from "cheerio";

function formatDateYYYYMMDD() {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() +1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
}

async function main() {
    // Get today date
    const dateAsString = formatDateYYYYMMDD();
    const url =
  "https://maltidsservice.uppsala.se/OpenMealBlock/GetMeals/" +
  `?startdate=${dateAsString}` +
  "&menuType=OpenMealDistributorIdSchool" +
  "&distributorId=ac50752d-16f3-4ffd-8037-3c3ec42c301f";

    // Fetch the page containing the weekly menu
    const res = await fetch(url);
    const jsonString = await res.text();
    const jsonObject = JSON.parse(jsonString);

    // Get the html part
    const htmlEscaped = jsonObject.html;

    // Decode to pure html
    const htmlDecoded = he.decode(htmlEscaped);

    // console.log(htmlDecoded);

    const $ = cheerio.load(htmlDecoded);
    let foundMenu = -1;
    let todayHeading = "";
    let todaysMenu = "";

    $(".weeklymenu--dailymenu").each((_i, el) => {
        console.log(_i);
        if (foundMenu > -1) return;

        todayHeading = $(el).find(".weeklymenu--date").text().trim();
        if (todayHeading !== "") {
            $(el).find("li").each((_j, li) => {
                const typeOfDish = $(li).find(".weeklymenu--typeofdish").text().trim();
                if (typeOfDish === "Dagens rätt" || typeOfDish === "Dagens alternativ") {
                    foundMenu = _i;
                    todaysMenu += $(li).text().replace(typeOfDish, "").trim() + "\n";
                }
            });
        }
    });

    if (todaysMenu === "")
        todaysMenu = "Ingen meny tillgänglig";

    // Tomorrow
    let tomorrowHeading = "";
    let tomorrowsMenu = "";

    $(".weeklymenu--dailymenu").each((_i, el) => {
        if (_i > foundMenu) {
            tomorrowHeading = $(el).find(".weeklymenu--date").text().trim();
            if (tomorrowHeading !== "") {
                // tomorrowsMenu += tomorrowHeading + "\n";
                $(el).find("li").each((_j, li) => {
                    const typeOfDish = $(li).find(".weeklymenu--typeofdish").text().trim();
                    if (typeOfDish === "Dagens rätt" || typeOfDish === "Dagens alternativ") {
                        foundMenu = 99;
                        tomorrowsMenu += $(li).text().replace(typeOfDish, "").trim() + "\n\n";
                    }
                });
            }
        }
    });

    if (tomorrowsMenu === "") {
        tomorrowsMenu = tomorrowHeading + "\n\nIngen meny tillgänglig";
    } else {
        tomorrowsMenu = tomorrowHeading + "\n" + tomorrowsMenu;
    }

    const data = [
        {
            textbox: [10, 4, 366, 30, `Lunchmeny: ${todayHeading}`, "fonts/calibrib30", 3, 1.2]
        },
        {
            textbox: [10, 39, 366, 86, todaysMenu, "fonts/bahnschrift20", 1, 1.2]
        },
        {
            textbox: [10, 130, 366, 48, tomorrowsMenu, "fonts/tahoma11", 1, 1.2]
        }
    ];
    fs.writeFileSync("lunchuppsala.json", JSON.stringify(data, null, 2));
    // console.log(data);
    // console.log("lunch.json genererad!");
}
main().catch(console.error);
