fetch('tasks.json')
    .then(res => res.json())
    .then(data => render(data))
    .catch(err => {
        document.getElementById("err").textContent = err.message;
        document.getElementById("err").style.display = "block";
        console.error(err);
    });

const ALLTASKS = {
    CLUB: ["SDESC","FOUND","CILUX","SEASN","STADE","MANGR","CHAIR","MERGE","WOMEN","TRANS","LINKS","LHERE","REFCK","SQUAD","ESTIN","DESTN","ASOCE","ASOCD","PLYRS","BADGE","HYPHN","HONOR","EUROP","EUFOT","MONDE","RTLLU","URLWD","FUSSB","TALKS"]
};

const TASKS_DESC = {
    ASOCD: "Category: Association_football_clubs_disestablished_in_YYYY",
    ASOCE: "Category: Association_football_clubs_established_in_YYYY",
    BADGE: "Badge size",
    CHAIR: "Current Chairman/President",
    CILUX: "Clubs in Luxembourg page listing",
    DESTN: "Category: YYYY_disestablishments_in_Luxembourg",
    ESTIN: "Category: YYYY_establishments_in_Luxembourg",
    EUFOT: "EU Football profile (eg https://eu-football.info/_club.php?id=1166)",
    EUROP: "European record",
    FOUND: "Year founded",
    FUSSB: "Fussball-lux profile",
    HONOR: "Honours",
    HYPHN: "Hyphen (season) checks",
    LHERE: "What links here",
    LINKS: "Links on page",
    MANGR: "Current manager",
    MERGE: "Club mergers",
    MONDE: "Mondefootball.fr profile (eg https://www.mondefootball.fr/teams/te18512/spora-luxemburg/)",
    PLYRS: "Category: CLUB_players",
    REFCK: "Load references into linkchecker",
    RTLLU: "RTL profile (eg https://www.rtl.lu/sport/futtball/resultater/teams?c=381)",
    SEASN: "Current season",
    SDESC: "Short description alignment",
    SQUAD: "Load team into Squad checker",
    STADE: "Stadium",
    TALKS: "Any talk page messages",
    TRANS: "Anything on LB+",
    URLWD: "URL in WikiData",
    WOMEN: "Women's team",
};

let thedata = null;
let modalContent = {};

function render(data) {
    thedata = data;
    const tblClub = document.getElementById("tasktable_club");
    let totalClub = 0;
    let doneClub = 0;

    const tblClubRow = document.createElement("TR");
    [0,1].forEach(padding=>{
        const setTaskCol = document.createElement("TD");
        setTaskCol.innerHTML = "&nbsp;";
        tblClubRow.appendChild(setTaskCol);
    });
    ALLTASKS["CLUB"].forEach(setTask=>{
        const setTaskCol = document.createElement("TD");
        const setTaskAttr = document.createElement("ABBR");
        setTaskAttr.setAttribute("title",TASKS_DESC[setTask]);
        setTaskAttr.textContent = setTask;
        setTaskCol.appendChild(setTaskAttr);
        tblClubRow.appendChild(setTaskCol);
    });
    [2].forEach(padding=>{
        const setTaskCol = document.createElement("TD");
        setTaskCol.innerHTML = "More";
        tblClubRow.appendChild(setTaskCol);
    });
    tblClub.appendChild(tblClubRow);

    Object.keys(data).forEach(page => {
        const item = data[page];
        const pageType = item.type;
        const tasks = item.tasks;
        const doneCount = tasks.filter(t => (t[0] || '').toUpperCase() === 'DONE').length;
        const skipCount = tasks.filter(t => (t[0] || '').toUpperCase() === 'SKIP').length;
        const totalDone = doneCount + skipCount;
        let totalTasks = ALLTASKS[pageType].length;
        tasks.forEach(([status, label]) => {
            if ( ! ALLTASKS[pageType].includes(label) ) {
                totalTasks++;
            }
        });
        totalClub += totalTasks;
        doneClub += totalDone;
        const perc = ((totalDone / (totalTasks||1))*100).toFixed(1);

        let target = null;
        switch ( pageType ) {
            case "CLUB": target = tblClub;
        }

        const itemRow = document.createElement("TR");
        const itemColPercent = document.createElement("TD");
        const itemColPage = document.createElement("TD");

        itemRow.setAttribute("data-percent",perc);

        const progress = document.createElement('progress');
        progress.max = totalTasks || 1;
        progress.value = totalDone;
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
        itemColPercent.appendChild(progressWrap);

        const wikiLink = document.createElement("A");
        wikiLink.setAttribute("href","https://en.wikipedia.org/wiki/"+page);
        wikiLink.setAttribute("target","_blank");
        wikiLink.textContent = `${page.replace(/_/g, ' ')}`;
        itemColPage.appendChild(wikiLink);

        let myTasks = {"_MOREDONE":0,"_MOREPENDING":0};
        modalContent[page] = [];
        item.tasks.forEach(([tStatus,tLabel])=>{
            if ( ALLTASKS[pageType].includes(tLabel) ) {
                myTasks[tLabel] = tStatus
            } else {
                if ( ["SKIP","DONE"].includes(tStatus) ) {
                    myTasks["_MOREDONE"]++;
                } else {
                    myTasks["_MOREPENDING"]++;
                }
                modalContent[page].push([tStatus,tLabel]);
            }
        });

        itemRow.appendChild(itemColPercent);
        itemRow.appendChild(itemColPage);

        ALLTASKS[pageType].forEach(setTask=>{
            const setTaskCol = document.createElement("TD");
            setTaskCol.innerHTML = "&nbsp;";
            setTaskCol.classList.add("task-status");
            if ( myTasks[setTask] ) {
                setTaskCol.classList.add("task-status__"+myTasks[setTask].toLowerCase());
            }
            itemRow.appendChild(setTaskCol);
        });
        const setTaskCol = document.createElement("TD");
        setTaskCol.setAttribute("data-modal-key",page);
        setTaskCol.innerHTML = myTasks["_MOREPENDING"] === 0 ? (myTasks["_MOREDONE"] === 0 ? "" : myTasks["_MOREDONE"] ) : myTasks["_MOREPENDING"];
        setTaskCol.classList.add("task-status","task-status__more");
        if ( myTasks["_MOREPENDING"] === 0 && myTasks["_MOREDONE"] === 0 ) {
            setTaskCol.classList.add("task-status__skip");
        } else if ( myTasks["_MOREPENDING"] === 0 ) {
            setTaskCol.classList.add("task-status__done");
        }
        itemRow.appendChild(setTaskCol);

        target.appendChild(itemRow);
    });

    document.getElementById("pClub").appendChild(drawPercent(doneClub,totalClub));

    document.getElementById("pTotal").appendChild(drawPercent(
        doneClub,
        totalClub,
        {fixed:3}));

    parseCheckSquads();

    sortTableRows(tblClub);

    initModal();
}

const overlay = document.getElementById("modal-overlay");
const closeBtn = document.getElementById("modal-close");
const content = document.getElementById("modal-content");

function initModal() {
    document.querySelectorAll("[data-modal-key]").forEach(btn => {
        btn.addEventListener("click", () => openModal(btn.dataset.modalKey));
    });
    closeBtn.addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.classList.contains("open")) {
            closeModal();
        }
    });
}

function openModal(key) {
    if ( modalContent[key] && modalContent[key].length !== 0 ) {
        modalContent[key].forEach(([tStatus,tLabel])=>{
            const taskLi = document.createElement("LI");
            taskLi.textContent = tLabel;
            taskLi.classList.add("task-status__"+tStatus.toLowerCase());
            content.appendChild(taskLi);
        });
        overlay.classList.add("open");
        document.body.classList.add("modal-open");
    }
}

function closeModal() {
    overlay.classList.remove("open");
    content.innerHTML = "";
    document.body.classList.remove("modal-open");
}

function sortTableRows(table) {
    const rows = Array.from(table.querySelectorAll("tr"));
    const noPercent = rows.filter(r => r.getAttribute('data-percent') === null);
    const withPercent = rows.filter(r => r.getAttribute('data-percent') !== null);
    withPercent.sort((a,b)=>{
        const percentA = parseFloat(a.getAttribute('data-percent')) || 0;
        const percentB = parseFloat(b.getAttribute('data-percent')) || 0;
        return percentB - percentA;
    });
    [...noPercent, ...withPercent].forEach(row => table.appendChild(row));
}

function drawPercent(done,total,options={}) {
    const fixed = options.fixed ?? 2;
    const allOrNothing = options.allOrNothing ?? false;

    const perc = ((done / total)*100).toFixed(fixed);

    const progress = document.createElement('progress');
    if ( allOrNothing ) {
        progress.classList.add("progress-allin");
        if ( done === total ) {
            progress.classList.add("progress-allin__success");
        }
    }
    progress.max = total || 1;
    progress.value = done;
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

    return progressWrap;
}

function parseCheckSquads() {
    fetch('/squadchecker/squads.json')
        .then(res => res.json())
        .then(data => renderSquads(data))
        .catch(err => {
            document.getElementById("err").textContent = err.message;
            document.getElementById("err").style.display = "block";
            console.error(err);
        });
}

function renderSquads(data) {
    squadsTotal = 0;
    squadsPassed = 0;
    modalContent.check_squad = [];
    data.forEach(club=>{
        squadsTotal++;
        if ( club.last_status === "OKAY" ) {
            squadsPassed++;
        } else {
            modalContent.check_squad.push(["NOTDONE",club.club + " -> " + club.last_reason]);
        }
    });
    if ( modalContent.check_squad.length === 0 ) {
        document.querySelector("#pCheckSquads [data-modal-key]").removeAttribute("data-modal-key");
    }
    document.getElementById("pCheckSquads").appendChild(drawPercent(squadsPassed,squadsTotal,{allOrNothing:true}));
}