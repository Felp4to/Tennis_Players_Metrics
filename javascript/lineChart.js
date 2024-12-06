// lineChart.js

import * as Constants from './constants.js';
import { getRankingbyData } from './filterData.js';
import { getDataPlayer } from './filterData.js';
import { applyFilter } from './filterData.js';
import { convertToYYYYMM } from './functions.js';


export function drawLineChart(jsonRanking, jsonPlayers, startInterval, endInterval, grain, nPlayers) {
    try {

        // select elements
        const coordinateDiv = d3.select('#coordinate');

        // VARIABLES 
            // cursor
        var cursorAbsX = null;                                  // posizione assoluta della x del cursore rispetto a svg
        var cursorAbsY = null;                                  // posizione assoluta della y del cursore rispetto a svg
        var cursorRelX = null;                                  // posizione relativa della x del cursore rispetto a svg
        var cursorRelY = null;                                  // posizione relativa della y del cursore rispetto a svg
        var cursorAxisX = null;                                 // valore dell'asse X
        var cursorAxisY = null;                                 // valore dell'asse Y
        var dateSlider = null;                                  // posizione dello slider

        // prepare data
        var jsonFilteredRanking = applyFilter(jsonRanking, startInterval, endInterval, grain, nPlayers);
        jsonFilteredRanking.forEach(element => {
            const info = getDataPlayer(jsonPlayers, element.player);
            element.info = info;
        });

        // group players data
        const players = d3.group(jsonFilteredRanking, d => d.player);

        // SVG
        const svg = d3.select('svg')
            .attr('width', Constants.svgWidth)
            .attr('height', Constants.svgHeight)
            .on('mousemove', function(event) {
                // Ottieni le coordinate del mouse relative all'elemento SVG
                cursorAbsX = Math.round(d3.pointer(event)[0]);              // Coordinate X nel sistema dell'SVG
                cursorAbsY = Math.round(d3.pointer(event)[1]);              // Coordinate Y nel sistema dell'SVG
                
                cursorRelX = Math.round(cursorAbsX - Constants.margin.left) + 1;
                cursorRelY = Math.round(cursorAbsY - Constants.margin.top) + 1;
                
                // Converti le coordinate del mouse in coordinate relative al grafico (basato sulla scala)
                cursorAxisX = x.invert(cursorAbsX - Constants.margin.left);
                const formatDate = d3.timeFormat('%Y-%m');
                cursorAxisX = formatDate(cursorAxisX);  
                cursorAxisY = Math.round(y.invert(cursorAbsY - Constants.margin.top));
                
                // Aggiungi un nuovo div per ciascuna variabile
                coordinateDiv.html(''); // Pulisce il contenuto del div prima di aggiungere nuovi div
                
                // Aggiungi div per ciascuna variabile
                coordinateDiv.append('div').text(`cursorAxisX: X: ${cursorAxisX}  --- cursorAxisY: Y: ${cursorAxisY}`);
                coordinateDiv.append('div').text(`cursorRelX: ${cursorRelX} --- cursorRelY: ${cursorRelY}`);
                coordinateDiv.append('div').text(`cursorAbsX: ${cursorAbsX} --- cursorAbsY: ${cursorAbsY}`);
                
                svg.selectAll(".dot")
                .each(function (d) {
                    // Ottieni la posizione del cerchio dall'elemento DOM
                    const cx = parseFloat(d3.select(this).attr("cx"));
                    const cy = parseFloat(d3.select(this).attr("cy"));
                    
                    // Verifica se l'elemento ha la classe uguale alla variabile dateSlider
                    const hasSpecificClass = d3.select(this).classed("date-" + dateSlider);
                    
                    if (hasSpecificClass) {
                        return; // Non proseguire con il resto del codice
                    }

                    // Se ha la classe uguale a dateSlider, rimuovi l'immagine dentro il cerchio
                    //d3.select(this.parentNode) // Il nodo contenitore è il parent del cerchio
                    //    .select("image")       // Seleziona l'immagine dentro il cerchio
                    //    .remove();             // Rimuovi l'immagine
            
                    // Calcola la distanza tra il cursore e il cerchio
                    const distance = Math.sqrt(
                        (cx - cursorRelX) ** 2 + (cy - cursorRelY) ** 2
                    );
            
                    // Rimuovi l'immagine se il cerchio è fuori dal range di hover
                    //if (distance > Constants.hoverDistance) {
                    //    d3.select(this.parentNode) // Il nodo contenitore è il parent del cerchio
                    //        .select("image")       // Seleziona l'immagine dentro il cerchio
                    //        .remove();             // Rimuovi l'immagine
                    //}
                });
            
            });

        svg.selectAll('*').remove();
        
        // add main container
        const container = svg.append('g')
            .attr('transform', `translate(${Constants.margin.left},${Constants.margin.top})`);
        
        // scale for the axis
        const x = d3.scaleTime()
            .domain(d3.extent(jsonFilteredRanking, d => d.data))
            .range([0, Constants.widthChart]);  
        
        const y = d3.scaleLinear()
            .domain([d3.max(jsonFilteredRanking.slice(0, nPlayers), d => d.rank), 1])
            .nice()
            .range([Constants.heightChart, 0]);
        
        // configure axis x
        const xAxis = d3.axisBottom(x);
        if (grain === 'Months') {
            xAxis.ticks(d3.timeMonth.every(1))
                .tickFormat(d3.timeFormat('%m-%y')); 
        } else if (grain === 'Years') {
            xAxis.ticks(d3.timeYear.every(1))
                .tickFormat(d3.timeFormat('%Y')); 
        }

        // configure axis y
        const yAxis = d3.axisLeft(y)
            .ticks(nPlayers)
            .tickFormat(d3.format("d"));
        
        // add axis to graph
        container.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${Constants.heightChart})`)
            .call(xAxis);

        container.append('g')
            .attr('class', 'y-axis')
            .call(yAxis);

        // add line into graph
        const line = d3.line()
            .x(d => x(d.data))
            .y(d => y(d.rank));

        // label axis
        container.append('text')
            .attr('x', Constants.widthChart / 2)
            .attr('y', Constants.heightChart + Constants.margin.bottom - 5)
            .style('text-anchor', 'middle')
            .text('Date');

        container.append('text')
            .attr('x', -Constants.heightChart / 2)
            .attr('y', -Constants.margin.left + 15)
            .style('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .text('Ranking');

        // Creazione della scala di colori pastello
        const color = d3.scaleOrdinal()
            .domain(Array.from(players.keys()))
            .range(d3.schemeCategory10.map(c => d3.interpolateLab(c, "#ffffff")(0.4)));

        // CHART LINES PLAYERS
        const allPoints = []; 
        players.forEach((playerData, player) => {
            // Disegna la linea per ogni giocatore
            container.append('path')
                .datum(playerData)                                          // Passa i dati del giocatore
                .attr('class', d => `line player-${player} date-${d.dataFormatted}`)   // Classe per lo stile
                .attr('d', line)                                            // Disegna la linea
                .style('stroke', color(player))                             // Colore della linea in base al giocatore
                .style('stroke-width', 2)                                   // Spessore della linea
                .style('fill', 'none');                                     // Nessun riempimento per la linea
        
            // Salva i punti per il controllo della distanza
            playerData.forEach(d => {
                allPoints.push({
                    x: x(d.data),
                    y: y(d.rank),
                    player,
                    rank: d.rank
                });
            });
        
            container.selectAll('.dot-' + player)
                .data(playerData)
                .enter().append('circle')
                .attr('class', d => `dot player-${d.player} date-${d.dataFormatted}`)
                .attr('cx', d => x(d.data))                             // Posizione X
                .attr('cy', d => y(d.rank))                             // Posizione Y
                .attr('r', (d, i) => i === 0 ? 20 : 4)                  // Raggio: 20 per il primo punto, 4 per gli altri
                .style('fill', d => color(d.player))
                .on('click', function(event, d) {
                    const playerClass = `player-${d.player}`;
                    
                    // Rendi visibili al 100% i punti e le linee del giocatore cliccato
                    d3.selectAll(`.${playerClass}`)
                        .transition()
                        .duration(500)
                        .style('opacity', 1);
                
                    // Rendi meno visibili tutti gli altri punti e linee
                    d3.selectAll(`.dot:not(.${playerClass})`)
                        .transition()
                        .duration(500)
                        .style('opacity', 0.3);
                
                    d3.selectAll(`.img-player:not(.${playerClass})`)
                        .transition()
                        .duration(500)
                        .style('opacity', 0.3);
                });
            
            // Aggiunta dei cerchi
            container.selectAll('.dot-' + player)
                .data(playerData)
                .enter().append('circle')
                .attr('class', d => `dot player-${d.player} date-${d.dataFormatted}`)
                .attr('cx', d => x(d.data))                             // Posizione X
                .attr('cy', d => y(d.rank))                             // Posizione Y
                .attr('r', (d, i) => i === 0 ? 20 : 4)                  // Raggio: 20 per il primo punto, 4 per gli altri
                .style('fill', d => color(d.player))
                .on('click', function(event, d) {
                    const playerClass = `player-${d.player}`;

                    d3.selectAll('.line').style('opacity', 0.3);
                    d3.selectAll('.dot').style('opacity', 0.3);
                    d3.selectAll('.img-player').style('opacity', 0.3);  
                    
                    // Rendi visibili al 100% i punti e le linee del giocatore cliccato
                    d3.selectAll(`.${playerClass}`)
                        .transition()
                        .duration(500)
                        .style('opacity', 1);

                    // Rendi meno visibili tutti gli altri punti e linee
                    d3.selectAll(`.dot:not(.${playerClass})`)
                        .transition()
                        .duration(500)
                        .style('opacity', 0.3);
                    
                    d3.selectAll(`.img-player:not(.${playerClass})`)
                        .transition()
                        .duration(500)
                        .style('opacity', 0.3);
                });

            // Aggiunta delle immagini al primo cerchio di ogni giocatore
            container.selectAll('.img-player-' + player)
                .data(playerData.filter((d, i) => i === 0)) // Filtra solo il primo elemento di ogni giocatore
                .enter().append('image')
                .attr('class', d => `img-player player-${d.player}`)
                .attr('width', 40)                              // Larghezza dell'immagine
                .attr('height', 40)                             // Altezza dell'immagine
                .attr('x', d => x(d.data) - 20)                 // Posizione X centrata (cx - larghezza/2)
                .attr('y', d => y(d.rank) - 20)                 // Posizione Y centrata (cy - altezza/2)
                .attr('xlink:href', d => `assets/images/${d.player}.png`);
            
        });

        // Aggiungi un evento click sull'SVG
        svg.on('click', function(event)
        {
            // Verifica se il target dell'evento è direttamente l'SVG
            if (event.target === this) 
            {
                console.log('Clicked on SVG background');
                // Aggiungi qui il codice che vuoi eseguire per il clic sullo sfondo
                d3.selectAll('.line').style('opacity', 0.3);
                d3.selectAll('.dot').style('opacity', 0.3);
                d3.selectAll('.img-player').style('opacity', 0.3);                
            }
        });

        // SLIDER
        // add rect for the slider
        const rect = container.append('rect')
            .attr('x', Constants.rectX)
            .attr('y', Constants.rectY)
            .attr('width', Constants.sliderWidth)
            .attr('height', Constants.sliderHeight)
            .attr('rx', 10) 
            .style('fill', 'lightgray')
            .style('opacity', 0.3) 
            .attr('name', 'rect-slider');

        // Creazione del triangolo
        const triangle = container.append('polygon')
            .attr('points', `${Constants.triangleX + Constants.triangleWidth / 2},
                            -${Constants.triangleHeight} ${Constants.triangleX},
                            -${Constants.yLowAngle} ${Constants.triangleX - Constants.triangleWidth / 2},
                            -${Constants.triangleHeight}`)
            .style('fill', 'gray')
            .attr('name', 'triangle-slider');
        
        // Ottieni le tacche dell'asse X
        const ticks = x.ticks();  // Restituirà un array di date
        
        // Funzione per ottenere la tacca più vicina in base alla posizione X
        const getClosestTick = (xPos) => {
            const xDate = x.invert(xPos);  // Converti la posizione in una data
            return ticks.reduce((prev, curr) => {
                return (Math.abs(curr - xDate) < Math.abs(prev - xDate) ? curr : prev);
            });
        };

        // Funzione per aggiornare la posizione del triangolo
        const updateTrianglePosition = (x) => {
            triangle.attr('points', `${x + Constants.triangleX + Constants.triangleWidth / 2},
                                    -${Constants.triangleHeight} ${Constants.triangleX + x},
                                    -${Constants.yLowAngle} ${x + Constants.triangleX - Constants.triangleWidth / 2},
                                    -${Constants.triangleHeight}`);
        };

        // Funzione per aggiornare la posizione del rettangolo
        const updateRectPosition = (x) => {
            rect.attr('x', Constants.rectX + x);
        };  

        // Imposta il drag handler
        const dragHandler = d3.drag()
            .on('drag', (event) => {
                svg.selectAll(".dot")
                    .attr("r", Constants.radiusNormal);

                // Calcola la nuova posizione lungo l'asse x
                const newX = event.x;

                // Limita la posizione X tra 0 e 800 (o il range della tua grafica)
                const clampedX = Math.max(0, Math.min(newX, Constants.widthChart));
                
                // Aggiorna la posizione del triangolo e del rettangolo in tempo reale
                updateTrianglePosition(clampedX);
                updateRectPosition(clampedX);
            })
            .on('end', (event) => {
                // Ottieni la tacca più vicina alla posizione finale del mouse
                const closestTick = getClosestTick(event.x);

                // Posiziona il triangolo e il rettangolo sulla tacca più vicina
                const closestTickX = x(closestTick);  // Ottieni la posizione x corrispondente alla data

                // Rimuovi immagine precedente se esiste
                svg.selectAll(".dot")
                .each(function () {
                    // Seleziona tutte le immagini con la classe `img-player` relative a questo cerchio
                    d3.select(this.parentNode) // Il nodo contenitore del cerchio
                        .selectAll("image.img-player") // Seleziona le immagini con classe `img-player`
                        .remove(); // Rimuovi tutte le immagini trovate
                });

                dateSlider = closestTick;            // aggiorno stato dello slider
                console.log("Posizione Slider:");
                console.log(convertToYYYYMM(dateSlider));

                updateTrianglePosition(closestTickX);
                updateRectPosition(closestTickX);

                // Trova tutti i cerchi con la classe "dot" e un "data" corrispondente alla data
                const tickString = d3.timeFormat('%Y-%m')(closestTick); // Converti la tacca in formato "yyyy-mm"
                
                // Seleziona i cerchi con la classe specifica e aggiorna il raggio
                container.selectAll('.date-' + tickString)
                    .transition()
                    .duration(150)
                    .attr('r', 20)
                    .on('end', function () {
                        // Al termine della transizione, aggiungi l'immagine
                        // Usa il nome della seconda classe per determinare il file PNG
                        const circle = d3.select(this); // Cerchio corrente

                        const classList = circle.attr('class').split(' '); // Ottieni tutte le classi del cerchio
                        const imageClass = classList[1].substring(7); // Supponendo che la seconda classe sia quella utile
                        const imagePath = "../assets/images/" + imageClass + '.png'; // Percorso dell'immagine
                        const defaultImagePath = "../assets/images/00000.png"; // Immagine di default

                        // Funzione per aggiungere un'immagine al cerchio
                        function appendImage(src) {
                            container.append('image')
                                .attr('xlink:href', src)
                                .attr('class', `img-player player-${imageClass}`)
                                .attr('width', 40)                      // Imposta la larghezza immagine
                                .attr('height', 40)                     // Imposta l'altezza immagine
                                .attr('x', circle.attr('cx') - 20)      // Centra l'immagine rispetto al cerchio
                                .attr('y', circle.attr('cy') - 20);     // Centra l'immagine rispetto al cerchio
                        }

                        // Controlla se il file esiste
                        fetch(imagePath, { method: 'HEAD' })
                            .then(response => {
                                if (response.ok) {
                                    // Se il file esiste
                                    appendImage(imagePath);
                                } else {
                                    // Se il file non esiste, usa l'immagine di default
                                    appendImage(defaultImagePath);
                                }
                            })
                            .catch(() => {
                                // In caso di errore, usa comunque l'immagine di default
                                appendImage(defaultImagePath);
                            });
                    });
            });

        // Associa il drag handler al triangolo
        dragHandler(triangle);
        
    } catch (error) {
        console.error('Errore nel disegno del grafico:', error);
        return null;
    }
}

