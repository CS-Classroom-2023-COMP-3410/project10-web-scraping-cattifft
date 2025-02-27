const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

async function scrapeEvents() {
    try {
        const { data } = await axios.get("https://denverpioneers.com/index.aspx");
        const $ = cheerio.load(data);

        // Find the script that contains "var obj"
        const scriptContent = $("script")
            .filter((i, el) => $(el).html().includes('var obj = {"start":0,"count":20,"name":"foo"'))
            .html();

        if (!scriptContent) {
            console.error("Event data script not found.");
            return;
        }

        // Extract JSON from script
        const jsonMatch = scriptContent.match(/var obj = (\{.*\});/s);
        if (!jsonMatch) {
            console.error("Could not extract JSON.");
            return;
        }

        const eventData = JSON.parse(jsonMatch[1]); // Convert to JavaScript object

        if (!eventData.data) {
            console.error("No event data found.");
            return;
        }

        // Extract required fields
        const events = eventData.data.map(event => ({
            duTeam: event.sport?.title || "Unknown DU Team",
            opponent: event.opponent?.title || "Unknown Opponent",
            date: event.date_utc || "Unknown Date"
        }));
        
        // console.log("Sample event data:", eventData.data[0]);
        // console.log("Sample items array:", eventData.data[0].items);
        // console.log("Full event data sample:", JSON.stringify(eventData, null, 2));

        // Save to JSON file
        const result = { events };
        fs.writeFileSync("results/athletic_events.json", JSON.stringify(result, null, 2));

        console.log("✅ Successfully saved event data!");

    } catch (error) {
        console.error("❌ Error scraping events:", error.message);
    }
}

scrapeEvents();
