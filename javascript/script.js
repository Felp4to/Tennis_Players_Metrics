// script.js

import { fetchJSONData } from './fetchData.js';
import { loadCsvFromUrl } from './fetchData.js';
import { drawLineChart } from './lineChart.js';


const form = document.getElementById('form');


document.getElementById('form').addEventListener('submit', async function(event) {
    event.preventDefault();

    // read data form
    var startInterval = document.getElementById('start').value;
    var endInterval = document.getElementById('end').value;
    var nPlayers = document.getElementById('players').value;
    let grain = null;

    document.querySelectorAll('input[name="grain"]').forEach(radio => {
        if (radio.checked) {
            grain = radio.value;
        }
    });

    try {
        // read data from files
        const jsonRanking = await fetchJSONData('./data/ranking/json/ranking_10s_clean.json');
        const jsonPlayers = await loadCsvFromUrl('./data/players/atp_players.csv');
        
        // create line chart
        drawLineChart(jsonRanking, jsonPlayers, startInterval, endInterval, grain, nPlayers);

    } catch (error) {
        console.error('Errore durante il caricamento dei dati:', error);
    }

});

