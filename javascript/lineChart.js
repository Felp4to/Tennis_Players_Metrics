// lineChart.js

import { getPointsbyDataRank } from './filterData.js';
import { getRankingbyData } from './filterData.js';
import { getDataPlayer } from './filterData.js';
import { applyFilter } from './filterData.js';


export function drawLineChart(jsonRanking, jsonPlayers, startInterval, endInterval, grain, nPlayers) {
    try {
        
        // Select html elements
        const playerId = d3.select('#player');
        const nameTooltip = d3.select('#name-tooltip');
        const lastTooltip = d3.select('#last-tooltip');
        const nationTooltip = d3.select('#nation-tooltip');
        const handTooltip = d3.select('#hand-tooltip');
        const heightTooltip = d3.select('#height-tooltip');
        const pointsTooltip = d3.select('#points-tooltip');
        const rankingTooltip = d3.select('#ranking-tooltip');
        const rankingCol = d3.select('#ranking-col');

        // Svuota il contenitore rankingCol eliminando tutti i suoi figli
        rankingCol.selectAll("*").remove();

        // clean e processing data
        var jsonFilteredRanking = applyFilter(jsonRanking, startInterval, endInterval, grain, nPlayers);

        jsonFilteredRanking.forEach(d => {
            // Parsing della data nel formato 'yyyy-mm'
            d.data = d3.timeParse('%Y-%m')(d.data);
            // Formattiamo la data nel formato 'yyyy-mm'
            d.dataFormatted = d3.timeFormat('%Y-%m')(d.data);
        });

        // Raggruppa i dati per giocatore
        const players = d3.group(jsonFilteredRanking, d => d.player);

        // Impostazioni del grafico
        const margin = { top: 50, right: 30, bottom: 50, left: 40 };

        // Larghezza totale dell'SVG (1100px)
        const svgWidth = 1500;
        const svgHeight = 600;

        // Il grafico occuperà il 70% della larghezza dell'SVG (770px)
        const widthChart = svgWidth * 0.65 - margin.left - margin.right;  // 70% della larghezza disponibile
        const heightChart = svgHeight - margin.top - margin.bottom;  // Altezza del grafico

        // Seleziona l'SVG principale e svuotalo
        const svg = d3.select('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight);
        svg.selectAll('*').remove();  // Pulizia

        // Aggiungi un contenitore principale per il grafico (senza margini)
        const container = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Scala per gli assi (X e Y)
        const x = d3.scaleTime()
            .domain(d3.extent(jsonFilteredRanking, d => d.data))
            .range([0, widthChart]);  // Limita la larghezza al 70%

        const y = d3.scaleLinear()
            .domain([d3.max(jsonFilteredRanking.slice(0, nPlayers), d => d.rank), 1]) // Scala invertita
            .nice()
            .range([heightChart, 0]);

        // Configurazione asse X (dinamico in base alla granularità)
        const xAxis = d3.axisBottom(x);
        if (grain === 'Months') {
            xAxis.ticks(d3.timeMonth.every(1))
                .tickFormat(d3.timeFormat('%m-%y'));  // Mostra 'mm-yy'
        } else if (grain === 'Years') {
            xAxis.ticks(d3.timeYear.every(1))
                .tickFormat(d3.timeFormat('%Y'));  // Mostra 'yyyy'
        }

        // Configura l'asse Y (numeri interi e nPlayers)
        const yAxis = d3.axisLeft(y)
            .ticks(nPlayers)
            .tickFormat(d3.format("d"));

        // Aggiungi gli assi al grafico
        container.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${heightChart})`)
            .call(xAxis);

        container.append('g')
            .attr('class', 'y-axis')
            .call(yAxis);

        // Aggiungi una linea al grafico
        const line = d3.line()
            .x(d => x(d.data))
            .y(d => y(d.rank));

        // Colori per le linee (mappati esplicitamente)
        const color = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(Array.from(players.keys()));

        // Traccia le linee per ogni giocatore
        const allPoints = []; // Memorizza tutti i punti per il calcolo delle distanze
        players.forEach((playerData, player) => {
            // Disegna la linea per il giocatore
            container.append('path')
                .datum(playerData)                          // Passa i dati del giocatore
                .attr('class', 'line')                      // Classe per lo stile
                .attr('d', line)                            // Disegna la linea
                .style('stroke', color(player))             // Colore della linea
                .style('stroke-width', 2)                   // Spessore della linea
                .style('fill', 'none');                     // Nessun riempimento

            // Salva i punti per il controllo della distanza
            playerData.forEach(d => {
                allPoints.push({
                    x: x(d.data),
                    y: y(d.rank),
                    player,
                    rank: d.rank // Memorizza anche il rank
                });
            });
            
            // Aggiungi i cerchi (pallini) sui punti della linea
            container.selectAll('.dot-' + player)
                .data(playerData)
                .enter().append('circle')
                .attr('class', 'dot')                          // Classe per i cerchi
                .attr('cx', d => x(d.data))                    // Posizione X (data)
                .attr('cy', d => y(d.rank))                    // Posizione Y (rank)
                .attr('r', 4)                                  // Raggio del cerchio
                .style('fill', color(player));                 // Colore del cerchio (lo stesso della linea)
        });

        // Etichette degli assi
        container.append('text')
            .attr('x', widthChart / 2)
            .attr('y', heightChart + margin.bottom - 5)
            .style('text-anchor', 'middle')
            .text('Date');

        container.append('text')
            .attr('x', -heightChart / 2)
            .attr('y', -margin.left + 15)
            .style('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .text('Ranking');

        // Aggiungi rettangoli allineati alle tacche dell'asse Y (per esempio)
        const ticksY2 = y.ticks(nPlayers);  // Usa i valori dei tick Y

        // Calcola la distanza tra due tacche consecutive sull'asse Y
        const tickDistance = Math.abs(y(ticksY2[1]) - y(ticksY2[0]));
        const padding = 5; // Padding tra rettangoli
        const rectHeight = tickDistance - padding; // Altezza rettangolo con padding

        const rectWidth = 400;  // Larghezza del rettangolo
        const rectOffset = 50;  // Distanza dal bordo destro del grafico

        // Gestione evento mousemove per verificare la distanza
        container.append('rect')
            .attr('width', widthChart)
            .attr('height', heightChart)
            .style('fill', 'none')
            .style('pointer-events', 'all') // Permette di intercettare eventi sul grafico
            .on('mousemove', function (event) {
                const [mouseX, mouseY] = d3.pointer(event, this);

                // Trova il punto più vicino
                let closestPoint = null;
                let minDistance = Infinity;
                allPoints.forEach(point => {
                    const distance = Math.sqrt(
                        Math.pow(point.x - mouseX, 2) + Math.pow(point.y - mouseY, 2)
                    );
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestPoint = point;
                    }
                });

                // Ingrandisci i punti vicini
                const threshold = 20; // Distanza massima per considerare un punto "vicino"
                container.selectAll('.dot')
                    .attr('r', d => {
                        const pointX = x(d.data);
                        const pointY = y(d.rank);
                        const distance = Math.sqrt(
                            Math.pow(pointX - mouseX, 2) + Math.pow(pointY - mouseY, 2)
                        );
                        return distance < threshold ? 8 : 4; // Ingrandisce se entro soglia, altrimenti torna normale
                    });
                
                // Ottieni la data corrispondente alla posizione del mouse sull'asse X
                const mouseDate = x.invert(mouseX); // Converti la posizione X in data
                const formattedDate = d3.timeFormat('%Y-%m')(mouseDate); // Formatta la data
                
                // Ottieni il rank corrispondente alla posizione del mouse sull'asse Y
                const mouseRank = y.invert(mouseY); // Converti la posizione Y in rank
                const formattedRank = Math.round(mouseRank); // Arrotonda il rank
                
                // con (Data e nPlayers) ottengo la lista dei primi nPlayers del ranking in quella data
                // questa lista contiene anche il punteggio atp
                var ranking = getRankingbyData(jsonFilteredRanking, formattedDate, nPlayers);

                var infoRanking = [];
                if (ranking.length) {
                    ranking.forEach(element => {
                        // Dall'id del player ottengo le informazioni generali del giocatore
                        let dict = getDataPlayer(jsonPlayers, element.player);
                        // Aggiungo il punteggio
                        dict["points"] = element.points;
                        infoRanking.push(dict);
                    });
                    // Svuota il contenitore rankingCol eliminando tutti i suoi figli
                    //rankingCol.selectAll("*").remove();
                    // Rimuovi prima gli elementi esistenti con la classe 'y-tick-text-second'
                    container.selectAll('.y-tick-circle').remove();
                    container.selectAll('.y-tick-text').remove();
                    container.selectAll('.y-tick-text-second').remove();

                    // Invert array
                    const reversedInfoRanking = infoRanking.slice().reverse();  
                    const reversedRanking = ranking.slice().reverse();

                    reversedRanking.forEach(element => {
                        let infoPlayer = getDataPlayer(jsonPlayers ,element.player);
                        element['name_first'] = infoPlayer.name_first;
                        element['name_last'] = infoPlayer.name_last;
                    });

                    //console.log(reversedRanking);

                    container.selectAll('.y-tick-circle')
                    .data(ticksY2)
                    .enter()
                    .append('g')
                    .attr('class', 'y-tick-circle')
                    .attr('transform', d => `translate(${widthChart + rectOffset}, ${y(d)})`)
                    .each(function(d, i) { // Usa `each` per gestire gli elementi del gruppo
                        d3.select(this)
                            .append('circle')
                            .attr('r', 30 - nPlayers)
                            .style('fill', 'lightblue')
                            .style('stroke', 'steelblue')
                            .style('stroke-width', 1);

                        d3.select(this)
                            .append('image')
                            .attr('xlink:href', `./assets/images/${reversedRanking[i].player}.png`) // Percorso immagine
                            .attr('x', -12.5) // Centra rispetto al cerchio
                            .attr('y', -12.5) // Centra rispetto al cerchio
                            .attr('width', 25)
                            .attr('height', 25);
                    });
                    
                    const initialOffset = 40; // Offset iniziale

                    container.selectAll('.y-tick-text')
                        .data(ticksY2)
                        .enter()
                        .append('g') // Usa un gruppo per contenere tutti i segmenti di testo
                        .attr('class', 'y-tick-text')
                        .attr('transform', d => `translate(${widthChart + rectOffset + initialOffset}, ${y(d)})`)  
                        .each(function(d, i) {
                            const playerInfo = reversedInfoRanking[i];
                            const group = d3.select(this);

                            // Nome del giocatore
                            group.append('text')
                                .text(`${playerInfo.name_first} ${playerInfo.name_last}`)
                                .attr('x', 0) // Prima colonna (relativa all'offset iniziale)
                                .style('text-anchor', 'start')
                                .style('fill', 'black')
                                .style('font-size', '12px');

                            // Punti
                            group.append('text')
                                .text(`Points: ${playerInfo.points}`)
                                .attr('x', 125) // Seconda colonna
                                .style('text-anchor', 'start')
                                .style('fill', 'black')
                                .style('font-size', '12px');

                            // Mano
                            group.append('text')
                                .text(`Hand: ${playerInfo.hand}`)
                                .attr('x', 215) // Terza colonna
                                .style('text-anchor', 'start')
                                .style('fill', 'black')
                                .style('font-size', '12px');

                            // Paese
                            group.append('text')
                                .text(`Country: ${playerInfo.ioc}`)
                                .attr('x', 280) // Quarta colonna
                                .style('text-anchor', 'start')
                                .style('fill', 'black')
                                .style('font-size', '12px');
                        });

                    // Aggiungi i nuovi elementi text per ogni tick dell'asse Y
                    //container.selectAll('.y-tick-text-second')
                    //    .data(ticksY2)
                    //    .enter()
                    //    .append('text')
                    //    .attr('class', 'y-tick-text-second')
                    //    .attr('x', widthChart + rectOffset + 40)  
                    //    .attr('y', d => y(d) + 15)  
                    //    .style('text-anchor', 'start')  
                    //    .text((d, i) => `Points: ${reversedInfoRanking[i].points}`)  
                    //    .style('fill', 'grey')  
                    //    .style('font-size', '10px');

                    // Esegui il log dopo aver aggiunto gli elementi
                    console.log(container.selectAll('.y-tick-circle').nodes());
                    console.log(container.selectAll('.y-y-tick-texxt').nodes());
                    console.log(container.selectAll('.y-tick-text-second').nodes());
                    
                }

            }).on('mouseout', () => {
                // Ripristina tutti i punti e nasconde i tooltip
                container.selectAll('.dot')
                    .attr('r', 4); // Torna alla dimensione normale
                //playerId.text('');
            });

    } catch (error) {
        console.error('Errore nel disegno del grafico:', error);
        return null;
    }
}
