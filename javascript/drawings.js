// drawing.js

import * as Constants from './constants.js';



export function addLines(x, y)
{
    // add line into graph
    const line = d3.line()
        .x(d => x(d.data))
        .y(d => y(d.rank));

    return line;
}

// draw a player's lines
export function drawLines(container, playerData, player, line, color)
{
    // draw lines
    container.append('path')
        .datum(playerData)                                                     // Passa i dati del giocatore
        .attr('class', d => `line player-${player} date-${d.dataFormatted}`)   // Classe per lo stile
        .attr('d', line)                                                       // Disegna la linea
        .style('stroke', color(player))                                        // Colore della linea in base al giocatore
        .style('stroke-width', 2)                                              // Spessore della linea
        .style('fill', 'none');                                                // Nessun riempimento per la linea
}

export function drawCircles(container, playerData, player, x, y, color)
{
    // draw circles
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

    // at the beginning shows images for the first column
    container.selectAll('.img-player-' + player)
        .data(playerData.filter((d, i) => i === 0)) // Filtra solo il primo elemento di ogni giocatore
        .enter().append('image')
        .attr('class', d => `img-player player-${d.player}`)
        .attr('width', 40)                              // Larghezza dell'immagine
        .attr('height', 40)                             // Altezza dell'immagine
        .attr('x', d => x(d.data) - 20)                 // Posizione X centrata (cx - larghezza/2)
        .attr('y', d => y(d.rank) - 20)                 // Posizione Y centrata (cy - altezza/2)
        .attr('xlink:href', d => `assets/images/${d.player}.png`);
}

// draw slider
export function drawSlider(container) {

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

    return { rect, triangle };
}