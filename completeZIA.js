document.addEventListener('DOMContentLoaded', function () {
  // Elements to toggle visibility together (filter out nulls safely)
  var elements = [];
  var e1 = document.getElementById('duplicate-zia-logo');
  var e2 = document.getElementById('duplicate-zia-lines');
  var e3 = document.getElementById('news-box');
  if (e1) elements.push(e1);
  if (e2) elements.push(e2);
  if (e3) elements.push(e3);

  var currentIndex = 0;
  var newsFiles = [];

  // --- A/B WEEK LABEL ---
  function isAWeek() {
    // First A-week Monday
    var startDate = new Date('2024-10-05');
    var nowDate = new Date();
    var diffInDays = Math.floor((nowDate - startDate) / (1000 * 60 * 60 * 24));
    var weeksPassed = Math.floor(diffInDays / 7);
    return (weeksPassed % 2 === 0) ? 'A' : 'B';
  }

  function updateWeekLabel() {
    var weekType = isAWeek(); // "A" or "B"
    var container = document.getElementById('week-label-container');
    var label = document.getElementById('week-label');
    if (!container || !label) return;

    label.textContent = weekType + '-WEEK BELL SCHEDULE';

    // toggle pill color
    container.className = container.className
      .replace(/\ba-week\b/g, '')
      .replace(/\bb-week\b/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    container.className += (container.className ? ' ' : '') + (weekType === 'A' ? 'a-week' : 'b-week');
  }
  updateWeekLabel();
  setInterval(updateWeekLabel, 60000);

  // --- UTIL: simple XHR helper ---
  function xhrGet(url, asJson, cb) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            if (asJson) {
              try { cb(null, JSON.parse(xhr.responseText)); }
              catch (e) { cb(null, []); }
            } else {
              cb(null, xhr.responseText);
            }
          } else {
            cb(new Error('HTTP ' + xhr.status));
          }
        }
      };
      xhr.onerror = function () { cb(new Error('Network error')); };
      xhr.send(null);
    } catch (err) {
      cb(err);
    }
  }

  // Load list of .txt files
  function loadNewsFiles() {
    xhrGet('filelist.json', true, function (err, files) {
      if (err) {
        console.log('Error fetching file list:', err);
        return;
      }
      newsFiles = files || [];
      if (newsFiles.length > 0) cycleThroughNews();
    });
  }

  // Fetch one news file (raw HTML)
  function fetchNewsContent(fileName, cb) {
    xhrGet(fileName, false, function (err, text) {
      if (err) {
        console.log('Error fetching news:', err);
        cb(null, '<div class="event-html">Unable to load: ' + fileName + '</div>');
        return;
      }
      cb(null, text);
    });
  }

  // Cycle news
  function cycleThroughNews() {
    var newsBox = document.getElementById('news-box');
    if (!newsBox || newsFiles.length === 0) return;

    fetchNewsContent(newsFiles[currentIndex], function (_err, content) {
      newsBox.innerHTML = '';
      var wrapper = document.createElement('div');
      wrapper.className = 'event-html';
      wrapper.innerHTML = (content || '');
      newsBox.appendChild(wrapper);

      // show
      for (var i = 0; i < elements.length; i++) {
        elements[i].classList.add('visible');
      }

      // visible for 10s
      setTimeout(function () {
        for (var j = 0; j < elements.length; j++) {
          elements[j].classList.remove('visible');
        }
        currentIndex = (currentIndex + 1) % newsFiles.length;
        // wait 10s, show next
        setTimeout(cycleThroughNews, 10000);
      }, 10000);
    });
  }

  loadNewsFiles();
});
