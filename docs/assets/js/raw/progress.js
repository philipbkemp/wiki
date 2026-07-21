fetch('tasks.json')
  .then(res => res.json())
  .then(data => render(data))
  .catch(err => {
    document.getElementById('accordion').textContent = 'Could not load tasks.json: ' + err.message;
  });

const ALLTASKS = {
    CLUB: ["SDESC","FOUND","CILUX","SEASN","STADE","MANGR","CHAIR","MERGE","WOMEN","TRANS","LINKS","LHERE","REFCK","ESTIN","DESTN","ASOCE","ASOCD","PLYRS","BADGE","HYPHN","HONOR","EUROP","EUFOT","RTLLU","URLWD","FUSSB","TALKS"]
};

const TASKS_DESC = {
    ASOCD: "Category: Association football clubs disbanded in __",
    ASOCE: "Category: Association football clubs established in __",
    BADGE: "Badge size",
    CHAIR: "Current Chairman/President",
    CILUX: "Clubs in Luxembourg page listing",
    DESTN: "Category: Disbanded in Luxmebourg in __",
    ESTIN: "Category: Established in Luxembourg in __",
    EUFOT: "EU Football profile",
    EUROP: "European record",
    FOUND: "Year founded",
    FUSSB: "Fussball-lux profile",
    HONOR: "Honours",
    HYPHN: "Hyphen (season) checks",
    LHERE: "What links here",
    LINKS: "Links on page",
    MANGR: "Current manager",
    MERGE: "Club mergers",
    PLYRS: "Category: Players of __",
    REFCK: "Load references into linkchecker",
    RTLLU: "RTL profile",
    SEASN: "Current season",
    SDESC: "Short description alignment",
    STADE: "Stadium",
    TALKS: "Any talk page messages",
    TRANS: "Anything on LB+",
    URLWD: "URL in WikiData",
    WOMEN: "Women's team",
};

function render(data) {
  const container = document.getElementById('accordion');
  container.innerHTML = '';

  Object.keys(data).forEach(title => {
    const entry = data[title] || {};
    const type = entry.type || '';
    const tasks = Array.isArray(entry.tasks) ? entry.tasks : [];
    const total = tasks.length;
    const doneCount = tasks.filter(t => (t[0] || '').toUpperCase() === 'DONE').length;
    const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

    // Progress bar using a simple <progress> element
    const progress = document.createElement('progress');
    progress.max = total || 1;
    progress.value = doneCount;

    const perc = ((doneCount / (total||1))*100).toFixed(1);

    const progressWrap = document.createElement("DIV");
    progressWrap.classList.add("progress-wrap");
    progressWrap.append(progress);

    const progressLabel = document.createElement("DIV");
    progressLabel.classList.add("progress-label");
    progressLabel.style.setProperty("--progress",`${perc}%`);
    const progFill = document.createElement("SPAN");
    progFill.classList.add("progress-label__fill");
    progFill.textContent = `${perc}%`;
    const progTrack = document.createElement("SPAN");
    progTrack.classList.add("progress-label__track");
    progTrack.textContent = `${perc}%`;
    progressLabel.appendChild(progFill);
    progressLabel.appendChild(progTrack);
    progressWrap.appendChild(progressLabel);

    // Header (always visible, click to toggle)
    const header = document.createElement('div');
    header.classList.add("accordion-opener");
    header.appendChild(progressWrap);

    const headerTitle = document.createElement("SPAN");
    headerTitle.textContent = `${title.replace(/_/g, ' ')}`
    header.appendChild(headerTitle);

    const aContent = document.createElement("DIV");
    aContent.classList.add("accordion-content");
    aContent.style.display = 'none';

    // Body (hidden until opened)
    const body = document.createElement('ul');

    let setTasks = [];

    tasks.forEach(([status, label]) => {
        const isDone = (status || '').toUpperCase() === 'DONE';

        if ( ALLTASKS[type].includes(label) ) {
            setTasks[label] = status;
        } else {

            const li = document.createElement('li');
            li.textContent = label;
            if ( isDone ) {
                li.classList.add("task-done");
            }
            body.appendChild(li);
        }
    });


    const common = document.createElement("TABLE");
    common.classList.add("common-tasks");
    const commonRow = document.createElement("TR");
    ALLTASKS[type].forEach(t=>{
        const commonCell = document.createElement("TD");
        commonCell.innerHTML = `<abbr title="${TASKS_DESC[t]}">${t}</abbr>`;
        commonCell.classList.add("task__"+setTasks[t].toLowerCase());
        if ( ! ["SKIP","DONE"].includes(setTasks[t].toUpperCase()) ) {
            commonCell.classList.add("task__unknown");
        }
        commonRow.appendChild(commonCell);
    });
    common.appendChild(commonRow);

    header.addEventListener('click', () => {
      aContent.style.display = (aContent.style.display === 'none') ? 'block' : 'none';
    });

    aContent.appendChild(common);
    aContent.appendChild(body);

    const item = document.createElement('div');
    item.appendChild(header);
    item.appendChild(aContent);

    container.appendChild(item);
  });
}