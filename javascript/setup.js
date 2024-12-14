// setup.js

import * as Constants from './constants.js';
import { Cursor } from './cursor.js';
import { clearSVG } from './utils.js';


// setup svg
export function setupSVG(x, y)
{
    // selection div where the coordinates should be shown
    const coordinateDiv = d3.select('#coordinate');

    // svg
    const svg = d3.select('svg')
        .attr('width', Constants.svgWidth)
        .attr('height', Constants.svgHeight)
        .on('mousemove', function(event)
        {
            // Ottieni le coordinate del mouse relative all'elemento SVG
            Cursor.cursorAbsX = Math.round(d3.pointer(event)[0]);              // Coordinate X nel sistema dell'SVG
            Cursor.cursorAbsY = Math.round(d3.pointer(event)[1]);              // Coordinate Y nel sistema dell'SVG
            
            Cursor.cursorRelX = Math.round(Cursor.cursorAbsX - Constants.margin.left) + 1;
            Cursor.cursorRelY = Math.round(Cursor.cursorAbsY - Constants.margin.top) + 1;
            
            // Converti le coordinate del mouse in coordinate relative al grafico (basato sulla scala)
            Cursor.cursorAxisX = x.invert(Cursor.cursorAbsX - Constants.margin.left);
            const formatDate = d3.timeFormat('%Y-%m');
            Cursor.cursorAxisX = formatDate(Cursor.cursorAxisX);  
            Cursor.cursorAxisY = Math.round(y.invert(Cursor.cursorAbsY - Constants.margin.top));
            
            // Aggiungi un nuovo div per ciascuna variabile
            coordinateDiv.html(''); // Pulisce il contenuto del div prima di aggiungere nuovi div
            
            // Aggiungi div per ciascuna variabile
            coordinateDiv.append('div').text(`cursorAxisX: X: ${Cursor.cursorAxisX}  --- cursorAxisY: Y: ${Cursor.cursorAxisY}`);
            coordinateDiv.append('div').text(`cursorRelX: ${Cursor.cursorRelX} --- cursorRelY: ${Cursor.cursorRelY}`);
            coordinateDiv.append('div').text(`cursorAbsX: ${Cursor.cursorAbsX} --- cursorAbsY: ${Cursor.cursorAbsY}`);
            
            svg.selectAll(".dot")
            .each(function (d) {
                // Ottieni la posizione del cerchio dall'elemento DOM
                const cx = parseFloat(d3.select(this).attr("cx"));
                const cy = parseFloat(d3.select(this).attr("cy"));
                
                // Verifica se l'elemento ha la classe uguale alla variabile dateSlider
                const hasSpecificClass = d3.select(this).classed("date-" + Cursor.dateSlider);
                
                if (hasSpecificClass) return;
                
                // Calcola la distanza tra il cursore e il cerchio
                const distance = Math.sqrt(
                    (cx - Cursor.cursorRelX) ** 2 + (cy - Cursor.cursorRelY) ** 2
                );
            });
        })
        .on('click', function(event)
        {
            // Verifica se il target dell'evento è direttamente l'SVG
            if (event.target === this) 
            {
                // Aggiungi qui il codice che vuoi eseguire per il clic sullo sfondo
                d3.selectAll('.line').style('opacity', 0.3);
                d3.selectAll('.dot').style('opacity', 0.3);
                d3.selectAll('.img-player').style('opacity', 0.3);                
            }
        });

    // clear graph
    clearSVG(svg);
    return svg;
}

// scales setup
export function setupScales(data, nPlayers) {
    // Scala per l'asse X (temporale)
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.data))
        .range([0, Constants.widthChart]);

    // Scala per l'asse Y (lineare)
    const y = d3.scaleLinear()
        .domain([d3.max(data.slice(0, nPlayers), d => d.rank), 1])
        .nice()
        .range([Constants.heightChart, 0]);

    return { x, y };
}

// setup axis
export function setupAxis(container, x, y, grain, nPlayers)
{
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

    // add axis to graph
    container.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${Constants.heightChart})`)
        .call(xAxis);

    container.append('g')
        .attr('class', 'y-axis')
        .call(yAxis);

    return { xAxis, yAxis };
}

export function setupContainer(svg)
{
    // add main container
    const container = svg.append('g')
        .attr('transform', `translate(${Constants.margin.left},${Constants.margin.top})`);

    return container;    
}

