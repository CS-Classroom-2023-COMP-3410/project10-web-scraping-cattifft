const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const baseUrl = "https://www.du.edu/calendar";
const outputPath = path.join(__dirname, 'results/calendar_events.json');

const months = [
    { start: '2025-01-01', end: '2025-02-01' },
    { start: '2025-02-01', end: '2025-03-01' },
    { start: '2025-03-01', end: '2025-04-01' },
    { start: '2025-04-01', end: '2025-05-01' },
    { start: '2025-05-01', end: '2025-06-01' },
    { start: '2025-06-01', end: '2025-07-01' },
    { start: '2025-07-01', end: '2025-08-01' },
    { start: '2025-08-01', end: '2025-09-01' },
    { start: '2025-09-01', end: '2025-10-01' },
    { start: '2025-10-01', end: '2025-11-01' },
    { start: '2025-11-01', end: '2025-12-01' },
    { start: '2025-12-01', end: '2026-01-01' }
];

async function fetchEventPage(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        // Modify this selector if the description is located somewhere specific
        return $('.event-description').text().trim() || null;
    } catch (error) {
        console.error(`Failed to fetch event details from ${url}: ${error.message}`);
        return null;
    }
}

async function scrapeEvents() {
    let allEvents = [];

    for (const month of months) {
        const url = `${baseUrl}?search=&start_date=${month.start}&end_date=${month.end}#events-listing-date-filter-anchor`;
        console.log(`Scraping events from: ${url}`);

        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);

            $('.events-listing__item').each(async (_, el) => {
                const eventTitle = $(el).find('h3').text().trim();
                const eventDate = $(el).find('p').first().text().trim();
                const eventTime = $(el).find('.icon-du-clock').parent().text().trim() || null;
                const eventLink = $(el).find('a.event-card').attr('href');
                const fullEventLink = eventLink ? `https://www.du.edu${eventLink}` : null;

                let eventDescription = null;
                if (fullEventLink) {
                    eventDescription = await fetchEventPage(fullEventLink);
                }

                allEvents.push({
                    title: eventTitle,
                    date: eventDate,
                    time: eventTime,
                    description: eventDescription,
                    // link: fullEventLink
                });
            });

        } catch (error) {
            console.error(`Error fetching events from ${url}: ${error.message}`);
        }
    }

    fs.writeFileSync(outputPath, JSON.stringify(allEvents, null, 2));
    console.log(`Scraping complete! Data saved to ${outputPath}`);
}

scrapeEvents();
