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
    NATIONAL: ["SDESC","LINKS","TRANS","LHERE","CATEG","HYPHN","MANGR","REFCK","TALKS"],
    OTHER: ["SDESC","LINKS","TRANS","LHERE","CATEG","HYPHN","REFCK","TALKS"],
    CATEG: ["SDESC","LINKS","LHERE"],
    SEASON: ["SDESC","CATEG","FUSSB","HPYHN","LHERE","LINKS","REFCK","TALKS","TRANS","PLAYD","GOALS","TOPSC","TABLE","CMAPS","XINLX","XINAF","EUFOT","RSLTS","TEAMS","STATS","INLXF"],
    PERSON: ["SDESC","CATEG","FUSSB","HYPHN","HONOR","PHOTO","REFCK","TALKS","TRANS","BIRTH","DEATH","CLUBP","ICAPS","IGOAL","MSTAT","GONFT","SCRWY","EUFOT","GOWFN"],
    CUPSEASON: ["SDESC",'CATEG","FUSSB","HYPHN',"REFCK","TALKS","TRANS","DHCKY","CTBLS","CTIER","QSFNL","FINAL","INLXF"]
};

const TASKS_DESC = {
    ASOCD: "Category: Association_football_clubs_disestablished_in_YYYY",
    ASOCE: "Category: Association_football_clubs_established_in_YYYY",
    BADGE: "Badge size",
    BIRTH: "Birth date and Category:YYYY births",
    CAPAC: "Capacity, with source",
    CATEG: "Categories review",
    CDATE: "Construction date(s)",
    CHAIR: "Current Chairman/President",
    CLIST: "Clubs in Luxembourg page listing",
    CLUBP: "Category:_CLUB_ players",
    CMAPS: "Map of Clubs",
    COORD: "Coordinates of location",
    CTBLS: "Each round as a table, with links to all clubs (even red-links)",
    CTIER: "Clubs per tier table before each round",
    DEATH: "Death date? and Category:YYYY deaths",
    DESTN: "Category: YYYY_disestablishments_in_Luxembourg",
    DHCKY: "Disambiguate to Luxembourg Cup Ice Hockey? (see 2006-07 Luxembourg Cup",
    ESTIN: "Category: YYYY_establishments_in_Luxembourg",
    EUFOT: "EU Football profile (eg https://eu-football.info/_club.php?id=1166)",
    EUROP: "European record",
    FINAL: "Final match shown as match row with all details",
    FOUND: "Year founded",
    FUSSB: "Fussball-lux profile",
    GOALS: "Goals scored count",
    GONFT: "Player profile on National-Football-Teams.com",
    GOWFN: "Player profile on World Football net",
    GRASS: "Grass or artificial",
    HONOR: "Honours",
    HOSTD: "Hosted any international or UEFA or notable matches",
    HYPHN: "Hyphen (season) checks",
    ICAPS: "International caps",
    IGOAL: "International goals table",
    INLXF: "YYYY-YY in Luxembourgian/ish Football template",
    LHERE: "What links here",
    LINKS: "Links on page",
    LOMAP: "Location map",
    MANGR: "Current manager",
    MERGE: "Club mergers",
    MONDE: "Mondefootball.fr profile (eg https://www.mondefootball.fr/teams/te18512/spora-luxemburg/)",
    MSTAT: "Manager statistics table?",
    PHOTO: "Main photo",
    PLAYD: "Games played total",
    PLYRS: "Category: CLUB_players",
    QSFNL: "Quarter and Semi final as match rows, not table, with scorers if known",
    REFCK: "Load references into linkchecker",
    RSLTS: "Results table matches standings table",
    RTLLU: "RTL profile (eg https://www.rtl.lu/sport/futtball/resultater/teams?c=381)",
    SCRWY: "Player profile on Soccerway",
    SDESC: "Short description alignment",
    SEASN: "Current season",
    SLIST: "List of stadiums in Luxembourg page",
    SQUAD: "Load team into Squad checker",
    STADB: "StadiumDB.com reference",
    STADE: "Stadium",
    STATS: "Infobox statistics",
    TABLE: "Table formatting and colours",
    TALKS: "Any talk page messages",
    TEAMS: "List of Teams/Stadiums/etc table",
    TENNT: "Current Tennant",
    TOPSC: "Top Scorers list",
    TRANS: "Anything on LB+",
    URLWD: "URL in WikiData",
    WOMEN: "Women's team",
    XINAF: "____ in Association Football > lists winner?",
    XINLX: "____ in Luxembourg > lists winner?"
};

const randomTask = {
    HIGH: {value:0,list:[]},
    LOW: {value:100,list:[]},
    MOST: {value:0,list:[]},
    CLUB: {list:[]},
    LEAGUE: {list:[]},
    STADIUM: {list:[]},
    NATIONAL: {list:[]},
    OTHER: {list:[]},
    CATEG: {list:[]},
    SEASON: {list:[]},
    PERSON: {list:[]},
    CUPSEASON: {list:[]},
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
    let totalOther = 0;
    let doneOther = 0;
    let totalCateg = 0;
    let doneCateg = 0;
    let totalSeason = 0;
    let doneSeason = 0;
    let totalPerson = 0;
    let donePerson = 0;
    let totalCupSeason = 0;
    let doneCupSeason = 0;

    Object.keys(data).forEach(page => {
        const item = data[page];
        const pageType = item.type;
        const tasks = item.tasks;
        const doneCount = tasks.filter(t => (t[0] || '').toUpperCase() === 'DONE').length;
        const skipCount = tasks.filter(t => (t[0] || '').toUpperCase() === 'SKIP').length;
        const totalDone = doneCount + skipCount;
        let notDoneList = [];
        let doneSetList = [];

        let totalTasks = ALLTASKS[pageType].length;
        tasks.forEach(([status, label]) => {
            if ( ! ALLTASKS[pageType].includes(label) ) {
                totalTasks++;
            } else {
                doneSetList.push(label);
            }
            if ( status === "NOTDONE" ) {
                notDoneList.push([pageType,page,label]);
            }
        });
        ALLTASKS[pageType].forEach(setTask=>{
            if ( ! doneSetList.includes(setTask) ) {
                notDoneList.push([pageType,page,setTask]);
            }
        });

        if ( totalDone === 0 ) {
            notDoneList = [ [pageType,page,"SDESC"] ];
        }

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
                break;
            case "OTHER":
                totalOther += totalTasks;
                doneOther += totalDone;
                break;
            case "CATEG":
                totalCateg += totalTasks;
                doneCateg += totalDone;
                break;
            case "SEASON":
                totalSeason += totalTasks;
                doneSeason += totalDone;
                break;
            case "PERSON":
                totalPerson += totalTasks;
                donePerson += totalDone;
                break;
            case "CUPSEASON":
                totalCupSeason += totalTasks;
                doneCupSeason += totalDone;
                break;
        }
        randomTask[pageType].list = [...randomTask[pageType].list,...notDoneList];

        const perc = ((totalDone / (totalTasks||1))*100);

        if ( perc === randomTask.HIGH.value && perc !== 100 ) {
            randomTask.HIGH.list = [...randomTask.HIGH.list,...notDoneList];
        } else if ( perc > randomTask.HIGH.value && perc !== 100 ) {
            randomTask.HIGH.value = perc;
            randomTask.HIGH.list = [...notDoneList];
        }

        if ( perc === randomTask.LOW.value ) {
            randomTask.LOW.list = [...randomTask.LOW.list,...notDoneList];
        } else if ( perc < randomTask.LOW.value ) {
            randomTask.LOW.value = perc;
            randomTask.LOW.list = [...notDoneList];
        }

        if ( notDoneList.length === randomTask.MOST.value ) {
            randomTask.MOST.list = [...randomTask.MOST.list,...notDoneList];
        } else if ( notDoneList.length > randomTask.MOST.value ) {
            randomTask.MOST.value = notDoneList.length;
            randomTask.MOST.list = [...notDoneList];
        }

        let target = tbl;

        const itemRow = document.createElement("TR");
        const itemColPercent = document.createElement("TD");
        const itemColPage = document.createElement("TD");

        itemRow.setAttribute("data-percent",perc.toFixed(1));

        const progress = document.createElement('progress');
        progress.max = totalTasks || 1;
        progress.value = totalDone;
        const progressWrap = document.createElement("DIV");
        progressWrap.classList.add("progress-wrap");
        progressWrap.append(progress);
        const progressLabel = document.createElement("DIV");
        progressLabel.classList.add("progress-label");
        progressLabel.style.setProperty("--progress",`${perc.toFixed(1)}%`);
        const progFill = document.createElement("SPAN");
        progFill.classList.add("progress-label__fill");
        progFill.textContent = `${perc.toFixed(1)}%`;
        const progTrack = document.createElement("SPAN");
        progTrack.classList.add("progress-label__track");
        progTrack.textContent = `${perc.toFixed(1)}%`;
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
    document.getElementById("pOther").appendChild(drawPercent(doneOther,totalOther));
    document.getElementById("pCateg").appendChild(drawPercent(doneCateg,totalCateg));
    document.getElementById("pSeasons").appendChild(drawPercent(doneSeason,totalSeason));
    document.getElementById("pCups").appendChild(drawPercent(doneCupSeason,totalCupSeason));
    document.getElementById("pPeople").appendChild(drawPercent(donePerson,totalPerson));

    document.getElementById("pTotal").appendChild(drawPercent(
        doneClub+doneLeague+doneStadium+doneNational+doneOther+doneCateg+doneSeason+doneCupSeason+donePerson,
        totalClub+totalLeague+totalStadium+totalNational+totalOther+totalCateg+totalSeason+totalCupSeason+totalPerson,
        {fixed:3}));

    parseCheckSquads();
    parseCheckLinks();

    sortTableRows(tbl);

    initModal();

    pickRandomTasks();
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

    const perc = ((done / total)*100);

    const progress = document.createElement('progress');
    if ( allOrNothing ) {
        progress.classList.add("progress-allin");
        if ( perc === 100 ) {
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
    progressLabel.style.setProperty("--progress",`${perc.toFixed(fixed)}%`);
    const progFill = document.createElement("SPAN");
    progFill.classList.add("progress-label__fill");
    progFill.textContent = `${perc.toFixed(fixed)}%`;
    const progTrack = document.createElement("SPAN");
    progTrack.classList.add("progress-label__track");
    progTrack.textContent = `${perc.toFixed(fixed)}%`;
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
                modalContent.check_links.push(["NOTDONE","Archive " + link.archive_status + " -> " + link.archive + "<br/>Used on:<br/>- " + link.citations.join("<br />- ")]);
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

function pickRandomTasks() {
    let chosenTasks = [];
    Object.keys(randomTask).forEach(cat=>{
        const randomTaskIndex = Math.floor(Math.random() * randomTask[cat].list.length);
        const thisChosenTask = randomTask[cat].list[randomTaskIndex];
        chosenTasks.push(["NOTDONE",thisChosenTask.join(": ")]);
    });
    modalContent["_random"] = chosenTasks;
}