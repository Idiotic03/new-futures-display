document.addEventListener('DOMContentLoaded', () => {
    // Elements to toggle visibility together
    const elements = [
        document.getElementById('duplicate-zia-logo'),
        document.getElementById('duplicate-zia-lines'),
        document.getElementById('news-box')
    ];

    let currentIndex = 0;
    let newsFiles = [];

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

        // Fetch content of the current .txt file
        fetchNewsContent(newsFiles[currentIndex]).then(content => {
            // Insert the raw HTML content into the news-box
            newsBox.innerHTML = content; // Since content is HTML formatted

            // Toggle visibility to show the news-box with content
            elements.forEach(element => {
                element.classList.add('visible');
            });

            // Fade-out after the content has been visible for 12 seconds
            setTimeout(() => {
                elements.forEach(element => {
                    element.classList.remove('visible');
                });

                // Move to the next file
                currentIndex = (currentIndex + 1) % newsFiles.length;

                // Wait for the fade-out to complete, then show the next news item after 30 seconds
                setTimeout(cycleThroughNews, 10000); // 30000ms = 30 seconds wait before showing the next item
            }, 10000); // 12000ms = 12 seconds visible time
        });
    }

    // Start loading and cycling through news files
    loadNewsFiles();
});
