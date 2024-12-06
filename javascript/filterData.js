// filterData.js

export function applyFilter(jsonFile, startInterval, endInterval, grain, nPlayers)
{
    try {
        var result = [];
        
        // years
        for (let year in jsonFile) {
            if (year < startInterval || year > endInterval) continue;
            const months = jsonFile[year];
            
            // check grain
            for (let month in months) {
                if (grain === 'Years' && month !== '01') continue;
                
                const rankings = months[month];
                const data = `${year}-${month.padStart(2, '0')}`;
                
                rankings.forEach(element => {
                    if (element.rank < nPlayers + 10)
                    {
                        result.push({
                            "data": data,
                            "rank": element.rank,
                            "player": element.player,
                            "points": element.points
                        });
                    }
                });
                
                // interrupt iteration after january if grain is years
                if (month === '01' && grain === 'Years') break;
            }
        }

        // order by data and rank 
        result.sort((a, b) => {
            // comparison by times
            if (a.data < b.data) return -1;
            if (a.data > b.data) return 1;
        
            // if times are equal, comparison by rank
            return a.rank - b.rank;
        });

        // convert to object Date
        result.forEach(d => {
            d.data = d3.timeParse('%Y-%m')(d.data);
            d.dataFormatted = d3.timeFormat('%Y-%m')(d.data);
        });

        return result;
        
    } catch (error) {
        console.error(error);
        return null;
    }
}

// restituisce il punteggio atp in base a una data e alla posizione del ranking
export function getPointsbyDataRank(data, yearMonth, rank)
{
    try {
        return data.find(item => item.dataFormatted === yearMonth && item.rank === rank).points;
    } catch(error) {
        console.log(error);
        return null;
    }
}

// restituisce la lista ranking dalla data e dal numero di giocatori
export function getRankingbyData(data, yearMonth, nPlayers)
{
    try {
        // Usa filter per trovare tutti gli elementi che rispettano le condizioni
        return data.filter(item => 
            item.dataFormatted === yearMonth && Number(item.rank) <= Number(nPlayers)
        );
    } catch (error) {
        console.error("Errore durante il filtraggio:", error);
        return []; // Restituisci un array vuoto in caso di errore
    }
}

// restituisce info giocatore a partire dato l'ID
export function getDataPlayer(data, playerId)
{
    return data.find(player => player.player_id === playerId);
}