fetch('div-nd.json')
    .then(res => res.json())
    .then(data => render(data))
    .catch(err => {
        document.getElementById("err").textContent = err.message;
        document.getElementById("err").style.display = "block";
        console.error(err);
    });

function render(data) {
    let matches = 0;
    let goals = 0;

    const winStreaks = {};
    const lossStreaks = {};
    const noWinStreak = {};
    const noLossStreak = {};

    let biggestHome = {margin:0,match:[]};
    let biggestAway = {margin:0,match:[]};
    let highestScoring = {goals:0,match:[]};

    data.forEach(match=>{
        matches++;

        const parts = match.split("=");
        const teams = parts[0].split("_");
        const score = parts[1].split("-");
        const hScore = parseInt(score[0]);
        const aScore = parseInt(score[1]);
        const hTeam = teams[0];
        const aTeam = teams[1];

        goals += hScore;
        goals += aScore;

        if ( ! (hTeam in winStreaks) ) { winStreaks[hTeam] = {current:0,longest:0}; }
        if ( ! (aTeam in winStreaks) ) { winStreaks[aTeam] = {current:0,longest:0}; }
        if ( ! (hTeam in lossStreaks) ) { lossStreaks[hTeam] = {current:0,longest:0}; }
        if ( ! (aTeam in lossStreaks) ) { lossStreaks[aTeam] = {current:0,longest:0}; }
        if ( ! (hTeam in noWinStreak) ) { noWinStreak[hTeam] = {current:0,longest:0}; }
        if ( ! (aTeam in noWinStreak) ) { noWinStreak[aTeam] = {current:0,longest:0}; }
        if ( ! (hTeam in noLossStreak) ) { noLossStreak[hTeam] = {current:0,longest:0}; }
        if ( ! (aTeam in noLossStreak) ) { noLossStreak[aTeam] = {current:0,longest:0}; }

        if ( hScore + aScore > highestScoring.goals ) {
            highestScoring.goals = hScore + aScore;
            highestScoring.match = [match];
        } else if ( hScore + aScore === highestScoring.goals ) {
            highestScoring.match.push(match);
        }

        if ( hScore > aScore ) { // home win
            winStreaks[hTeam].current += 1;
            winStreaks[aTeam].current = 0;
            lossStreaks[aTeam].current += 1;
            lossStreaks[hTeam].current = 0;
            noWinStreak[hTeam].current = 0;
            noWinStreak[aTeam].current += 1;
            noLossStreak[hTeam].current += 1;
            noLossStreak[aTeam].current = 0;

            if ( hScore - aScore > biggestHome.margin ) {
                biggestHome.margin = hScore - aScore;
                biggestHome.match = [match];
            } else if ( hScore - aScore === biggestHome.margin ) {
                biggestHome.match.push(match);
            }

        } else if ( aScore > hScore ) { // away win
            winStreaks[hTeam].current = 0;
            winStreaks[aTeam].current += 1;
            lossStreaks[hTeam].current += 1;
            lossStreaks[aTeam].current = 0;
            noWinStreak[hTeam].current += 1;
            noWinStreak[aTeam].current = 0;
            noLossStreak[hTeam].current = 0;
            noLossStreak[aTeam].current += 1;

            if ( aScore - hScore > biggestAway.margin ) {
                biggestAway.margin = aScore - hScore;
                biggestAway.match = [match];
            } else if ( aScore - hScore === biggestAway.margin ) {
                biggestAway.match.push(match);
            }

        } else { // draw
            winStreaks[hTeam].current = 0;
            winStreaks[aTeam].current = 0;
            lossStreaks[hTeam].current = 0;
            lossStreaks[aTeam].current = 0;
            noWinStreak[hTeam].current += 1;
            noWinStreak[aTeam].current += 1;
            noLossStreak[hTeam].current += 1;
            noLossStreak[aTeam].current += 1;
        }

        winStreaks[hTeam].longest = Math.max(winStreaks[hTeam].longest, winStreaks[hTeam].current);
        winStreaks[aTeam].longest = Math.max(winStreaks[aTeam].longest, winStreaks[aTeam].current);
        lossStreaks[hTeam].longest = Math.max(lossStreaks[hTeam].longest, lossStreaks[hTeam].current);
        lossStreaks[aTeam].longest = Math.max(lossStreaks[aTeam].longest, lossStreaks[aTeam].current);
        noWinStreak[hTeam].longest = Math.max(noWinStreak[hTeam].longest, noWinStreak[hTeam].current);
        noWinStreak[aTeam].longest = Math.max(noWinStreak[aTeam].longest, noWinStreak[aTeam].current);
        noLossStreak[hTeam].longest = Math.max(noLossStreak[hTeam].longest, noLossStreak[hTeam].current);
        noLossStreak[aTeam].longest = Math.max(noLossStreak[aTeam].longest, noLossStreak[aTeam].current);
    });

    document.getElementById("match_count").textContent = matches;
    document.getElementById("goal_count").textContent = goals;

    let streakWins = {count:0,list:[]};
    let streakLosses = {count:0,list:[]};
    let streakUndefeated = {count:0,list:[]};
    let streakNoWins = {count:0,list:[]};

    Object.keys(winStreaks).forEach(k=>{
        let v = winStreaks[k];
        if ( v.longest > streakWins.count ) {
            streakWins.count = v.longest;
            streakWins.list = [k];
        } else if ( v.longest === streakWins.count ) {
            streakWins.list.push(k);
        }
    });
    Object.keys(lossStreaks).forEach(k=>{
        let v = lossStreaks[k];
        if ( v.longest > streakLosses.count ) {
            streakLosses.count = v.longest;
            streakLosses.list = [k];
        } else if ( v.longest === streakLosses.count ) {
            streakLosses.list.push(k);
        }
    });
    Object.keys(noWinStreak).forEach(k=>{
        let v = noWinStreak[k];
        if ( v.longest > streakNoWins.count ) {
            streakNoWins.count = v.longest;
            streakNoWins.list = [k];
        } else if ( v.longest === streakNoWins.count ) {
            streakNoWins.list.push(k);
        }
    });
    Object.keys(noLossStreak).forEach(k=>{
        let v = noLossStreak[k];
        if ( v.longest > streakUndefeated.count ) {
            streakUndefeated.count = v.longest;
            streakUndefeated.list = [k];
        } else if ( v.longest === streakUndefeated.count ) {
            streakUndefeated.list.push(k);
        }
    });

    document.getElementById("win_streak").textContent = streakWins.count + " match" + (streakWins.count !== 1 ? "es" : "");
    document.getElementById("win_streak2").textContent = streakWins.list.length + " clubs: " + streakWins.list.join("; ");
    document.getElementById("unbeaten_streak").textContent = streakUndefeated.count + " match" + (streakUndefeated.count !== 1 ? "es" : "");
    document.getElementById("unbeaten_streak2").textContent = streakUndefeated.list.length + " clubs: " + streakUndefeated.list.join("; ");
    document.getElementById("winless_streak").textContent = streakNoWins.count + " match" + (streakNoWins.count !== 1 ? "es" : "");
    document.getElementById("winless_streak2").textContent = streakNoWins.list.length + " clubs: " + streakNoWins.list.join("; ");
    document.getElementById("losing_streak").textContent = streakLosses.count + " match" + (streakLosses.count !== 1 ? "es" : "");
    document.getElementById("losing_streak2").textContent = streakLosses.list.length + " clubs: " + streakLosses.list.join("; ");

    document.getElementById("home_win").textContent = biggestHome.match.length !== 0 ? biggestHome.match.join("<br />") : "---";
    document.getElementById("away_win").textContent = biggestAway.match.length !== 0 ? biggestAway.match.join("<br />") : "---";
    document.getElementById("high_score").textContent = highestScoring.match.length !== 0 ? highestScoring.match.join("<br />") : "---";
}