const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://bulletin.du.edu/undergraduate/majorsminorscoursedescriptions/traditionalbachelorsprogrammajorandminors/computerscience/#coursedescriptionstext';

axios.get(url).then((response) => {
    const $ = cheerio.load(response.data);
    let courses = [];

    $('.sc_sccoursedescs .courseblock').each((_, element) => {
        let titleText = $(element).find('.courseblocktitle strong').text().trim();
        let descHtml = $(element).find('.courseblockdesc').html() || ''; // Get HTML to check for <a> tags
        let descText = $(element).find('.courseblockdesc').text().trim(); // Get plain text description

        // Extract course code and title (allowing flexible credit formats)
        let match = titleText.match(/COMP(?:&nbsp;|\s)(\d{4})\s(.*?)\s\((.*?)Credits\)/);
        if (match) {
            let courseCode = parseInt(match[1], 10);
            let courseTitle = match[2];
            let creditInfo = match[3];

            // Ensure course meets conditions (code >= 3000, no prerequisites)
            if (courseCode >= 3000 && !descHtml.includes('<a')) {
                courses.push({
                    course: `COMP-${courseCode}`,
                    title: courseTitle,
                    // Doing a little extra!
                    credits: creditInfo,
                    description: descText || "No description available."
                });
            }
        }
    });

    // Save to JSON file
    fs.writeFileSync('results/courses.json', JSON.stringify({ courses }, null, 4));
    console.log('Courses saved successfully!');
}).catch(error => {
    console.error('Error fetching page:', error);
});