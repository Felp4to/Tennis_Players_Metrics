// functions.js

import * as Constants from './constants.js';

// convert format date
export function convertToYYYYMM(dateString)
{
    // Converte la stringa in un oggetto Date
    const date = new Date(dateString);

    // Ottieni l'anno
    const year = date.getFullYear();

    // Ottieni il mese (aggiungi 1 perché i mesi in JavaScript sono indicizzati da 0)
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Assicura 2 cifre

    // Combina anno e mese nel formato richiesto
    return `${year}-${month}`;
}

// get colors
export function getColorScale(players)
{
    // Creazione della scala di colori pastello
    return d3.scaleOrdinal()
        .domain(Array.from(players.keys()))
        .range(d3.schemeCategory10.map(c => d3.interpolateLab(c, "#ffffff")(0.4)));
}

// clear SVG
export function clearSVG(svg)
{
    // clear graph
    svg.selectAll('*').remove();
}


