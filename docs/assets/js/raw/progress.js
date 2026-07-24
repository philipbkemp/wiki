fetch('tasks.json')
    .then(res => res.json())
    .then(data => render(data))
    .catch(err => {
        document.getElementById("err").textContent = err.message;
        document.getElementById("err").style.display = "block";
        console.error(err);
    });

const ALLTASKS = {
    CLUB: ["SDESC","FOUND","CLIST","SEASN","STADE","MANGR","CHAIR","MERGE","WOMEN","CATEG","TRANS","LINKS","LHERE","REFCK","SQUAD","ESTIN","DESTN","ASOCE","ASOCD","PLYRS","BADGE","HYPHN","HONOR","EUROP","EUFOT","MONDE","RTLLU","URLWD","FUSSB","TALKS"],
    LEAGUE: ["SDESC","TRANS","LHERE","LINKS","HYPHN","REFCK","TALKS","CATEG"],
    STADIUM: ["SDESC","SLIST","CDATE","PHOTO","LOMAP","CAPAC","GRASS","TENNT","STADB","HOSTD","COORD","TRANS","LINKS","LHERE","HYPHN","REFCK","TALKS","CATEG"],
    NATIONAL: ["SDESC","LINKS","TRANS","LHERE","CATEG","HYPHN","MANGR","REFCK","TALKS"]
};

const TASKS_DESC = {
    ASOCD: "Category: Association_football_clubs_disestablished_in_YYYY",
    ASOCE: "Category: Association_football_clubs_established_in_YYYY",
    BADGE: "Badge size",
    CAPAC: "Capacity, with source",
    CATEG: "Categories review",
    CDATE: "Construction date(s)",
    CHAIR: "Current Chairman/President",
    CLIST: "Clubs in Luxembourg page listing",
    COORD: "Coordinates of location",
    DESTN: "Category: YYYY_disestablishments_in_Luxembourg",
    ESTIN: "Category: YYYY_establishments_in_Luxembourg",
    EUFOT: "EU Football profile (eg https://eu-football.info/_club.php?id=1166)",
    EUROP: "European record",
    FOUND: "Year founded",
    FUSSB: "Fussball-lux profile",
    GRASS: "Grass or artificial",
    HONOR: "Honours",
    HOSTD: "Hosted any international or UEFA or notable matches",
    HYPHN: "Hyphen (season) checks",
    LHERE: "What links here",
    LINKS: "Links on page",
    LOMAP: "Location map",
    MANGR: "Current manager",
    MERGE: "Club mergers",
    MONDE: "Mondefootball.fr profile (eg https://www.mondefootball.fr/teams/te18512/spora-luxemburg/)",
    PHOTO: "Main photo",
    PLYRS: "Category: CLUB_players",
    REFCK: "Load references into linkchecker",
    RTLLU: "RTL profile (eg https://www.rtl.lu/sport/futtball/resultater/teams?c=381)",
    SEASN: "Current season",
    SDESC: "Short description alignment",
    SLIST: "List of stadiums in Luxembourg page",
    SQUAD: "Load team into Squad checker",
    STADB: "StadiumDB.com reference",
    STADE: "Stadium",
    TALKS: "Any talk page messages",
    TENNT: "Current Tennant",
    TRANS: "Anything on LB+",
    URLWD: "URL in WikiData",
    WOMEN: "Women's team",
};

let thedata = null;
let modalContent = {};

function render(data) {
    thedata = data;

    const tbl = document.getElementById("tasktable_all");
    let totalClub = 0;
    let doneClub = 0;
    let totalLeague = 0;
    let doneLeague = 0;
    let totalStadium = 0;
    let doneStadium = 0;
    let totalNational = 0;
    let doneNational = 0;

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
        switch ( pageType ) {
            case "CLUB":
                totalClub += totalTasks;
                doneClub += totalDone;
                break;
            case "LEAGUE":
                totalLeague += totalTasks;
                doneLeague += totalDone;
                break;
            case "STADIUM":
                totalStadium += totalTasks;
                doneStadium += totalDone;
                break;
            case "NATIONAL":
                totalNational += totalTasks;
                doneNational += totalDone;
        }

        const perc = ((totalDone / (totalTasks||1))*100).toFixed(1);

        let target = tbl;

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

        ALLTASKS[pageType].forEach(setTask=>{
            const setTaskCol = document.createElement("TD");

            const setTaskAttr = document.createElement("ABBR");
            setTaskAttr.setAttribute("title",TASKS_DESC[setTask]);
            setTaskAttr.textContent = setTask;
            setTaskCol.appendChild(setTaskAttr);

            setTaskCol.classList.add("task-status");
            if ( myTasks[setTask] ) {
                setTaskCol.classList.add("task-status__"+myTasks[setTask].toLowerCase());
            }
            itemRow.appendChild(setTaskCol);
        });

        target.appendChild(itemRow);
    });

    document.getElementById("pClub").appendChild(drawPercent(doneClub,totalClub));
    document.getElementById("pLeague").appendChild(drawPercent(doneLeague,totalLeague));
    document.getElementById("pStadium").appendChild(drawPercent(doneStadium,totalStadium));
    document.getElementById("pNational").appendChild(drawPercent(doneNational,totalNational));

    document.getElementById("pTotal").appendChild(drawPercent(
        doneClub+doneLeague+doneStadium+doneNational,
        totalClub+totalLeague+totalStadium+totalNational,
        {fixed:3}));

    parseCheckSquads();
    parseCheckLinks();

    sortTableRows(tbl);

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
            taskLi.innerHTML = tLabel;
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
    fetch('squadchecker/squads.json')
        .then(res => res.json())
        .then(data => renderSquadChecker(data))
        .catch(err => {
            document.getElementById("err").textContent = err.message;
            document.getElementById("err").style.display = "block";
            console.error(err);
        });
}

function parseCheckLinks() {
    fetch('linkchecker/urls.json')
        .then(res => res.json())
        .then(data => renderLinkChecker(data))
        .catch(err => {
            document.getElementById("err").textContent = err.message;
            document.getElementById("err").style.display = "block";
            console.error(err);
        });
}

function renderSquadChecker(data) {
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

function renderLinkChecker(data) {
    linksTotal = 0;
    linksPassed = 0;
    modalContent.check_links = [];
    data.forEach(link=>{
        linksTotal++;
        if ( link.archive_status ) {
            if ( link.archive_status === "OKAY" ) {
                linksPassed++;
            } else {
                modalContent.check_links.push(["NOTDONE","Archive " + link.archive_status + " -> " + link.url + "<br/>Used on:<br/>- " + link.citations.join("<br />- ")]);
            }
        } else if ( link.last_status === "OKAY" ) {
            linksPassed++;
        } else {
            modalContent.check_links.push(["NOTDONE",link.last_status + " -> " + link.url + "<br/>Used on:<br/>- " + link.citations.join("<br />- ")]);
        }
    });
    if ( modalContent.check_links.length === 0 ) {
        document.querySelector("#pCheckLinks [data-modal-key]").removeAttribute("data-modal-key");
    }
    document.getElementById("pCheckLinks").appendChild(drawPercent(linksPassed,linksTotal,{allOrNothing:true}));
}