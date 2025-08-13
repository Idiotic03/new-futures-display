document.addEventListener('DOMContentLoaded', () => {
    // Elements to toggle visibility together
    const elements = [
        document.getElementById('duplicate-zia-logo'),
        document.getElementById('duplicate-zia-lines'),
        document.getElementById('news-box')
    ].filter(Boolean);

    let currentIndex = 0;
    let newsFiles = [];

    // --- A/B WEEK LABEL ----------------------------------------
    function isAWeek() {
        // Set your first A-week Monday here
        const startDate = new Date('2024-08-05');
        const nowDate = new Date();
        const diffInDays = Math.floor((nowDate - startDate) / (1000 * 60 * 60 * 24));
        const weeksPassed = Math.floor(diffInDays / 7);
        return weeksPassed % 2 === 0 ? 'A' : 'B'; // even = A-week
    }

    function updateWeekLabel() {
        const weekType = isAWeek(); // "A" or "B"
        const container = document.getElementById('week-label-container');
        const label = document.getElementById('week-label');
        if (!container || !label) return;

        // Set text like "A-WEEK" or "B-WEEK"
        label.textContent = `${weekType}-WEEK BELL SCHEDULE`;

        // Switch container color class
        container.classList.remove('a-week', 'b-week');
        container.classList.add(weekType.toLowerCase() + '-week');
    }
    // Run now and refresh occasionally (handles date rollover)
    updateWeekLabel();
    setInterval(updateWeekLabel, 60_000);
    // -----------------------------------------------------------

    // Function to load list of .txt files from a JSON file
    function loadNewsFiles() {
        fetch('filelist.json') // Fetch the list of .txt files from a JSON file
            .then(response => response.json())
            .then(files => {
                newsFiles = files;
                if (newsFiles.length > 0) {
                    cycleThroughNews();
                }
            })
            .catch(error => console.error('Error fetching file list:', error));
    }

    // Function to fetch content from a .txt file
    function fetchNewsContent(fileName) {
        return fetch(fileName)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .catch(error => console.error('Error fetching news:', error));
    }

    // Function to cycle through the news files and display their content
    function cycleThroughNews() {
        const newsBox = document.getElementById('news-box');
        if (!newsBox) return;

        // Fetch content of the current .txt file
        fetchNewsContent(newsFiles[currentIndex]).then(content => {
            // UPDATED: wrap in .event-html so your sizing styles apply
            newsBox.innerHTML = '';
            const wrapper = document.createElement('div');
            wrapper.className = 'event-html';
            wrapper.innerHTML = content; // content is HTML formatted
            newsBox.appendChild(wrapper);

            // Toggle visibility to show the news-box with content
            elements.forEach(element => {
                element.classList.add('visible');
            });

            // Fade-out after the content has been visible for 10 seconds
            setTimeout(() => {
                elements.forEach(element => {
                    element.classList.remove('visible');
                });

                // Move to the next file
                currentIndex = (currentIndex + 1) % newsFiles.length;

                // Wait for the fade-out to complete, then show the next news item after 10 seconds
                setTimeout(cycleThroughNews, 10000);
            }, 10000);
        });
    }

    // Start loading and cycling through news files
    loadNewsFiles();
});
