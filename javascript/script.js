// script.js

import { fetchJSONData } from './fetchData.js';
import { loadCsvFromUrl } from './fetchData.js';
import { drawLineChart } from './lineChart.js';
import { domElements } from './domElements.js';


document.getElementById('form').addEventListener('submit', async function(event) {
    event.preventDefault();

    // read data form
    var startInterVal = domElements.startInterval.value;
    var endIntervVal = domElements.endInterval.value;
    var nPlayersVal = domElements.nPlayers.value;
    let grain = null;
    
    domElements.radios.forEach(radio => {
        if (radio.checked) {
            grain = radio.value;
        }
    });
    
    try {
        // read data from files
        const jsonRanking = await fetchJSONData('./data/ranking/json/ranking_10s_clean.json');
        const jsonPlayers = await loadCsvFromUrl('./data/players/atp_players.csv');
        
        // create line chart
        drawLineChart(jsonRanking, jsonPlayers, startInterVal, endIntervVal, grain, nPlayersVal);

    } catch (error) {
        console.error('Errore durante il caricamento dei dati:', error);
    }

});

