// lineChart.js

import { setupSVG, setupScales, setupAxis, setupContainer } from './setup.js';
import { getColorScale } from './utils.js';
import { getDataForLineChart } from './filterData.js';
import { addLines, drawLines, drawCircles, drawSlider} from './drawings.js';
import { initializeDragHandler} from './interaction.js';


export function drawLineChart(jsonRanking, jsonPlayers, startInterval, endInterval, grain, nPlayers)
{
    try {

        // filter and integrate data
        var jsonFilteredRanking = getDataForLineChart(jsonRanking, jsonPlayers, startInterval, endInterval, grain, nPlayers);

        // group players data
        const players = d3.group(jsonFilteredRanking, d => d.player);

        // configure scales
        const { x, y } = setupScales(jsonFilteredRanking, nPlayers);

        // svg setup
        const svg = setupSVG(x, y);

        // setup container
        const container = setupContainer(svg);

        // setup axis
        const { xAxis, yAxis } = setupAxis(container, x, y, grain, nPlayers);

        // lines
        const line = addLines(x, y);
        
        // color scale
        const color = getColorScale(players);

        // draw lines and circles
        players.forEach((playerData, player) => {
            drawLines(container, playerData, player, line, color);
            drawCircles(container, playerData, player, x, y, color);
        });

        // draw slider
        var slider = drawSlider(container);

        // initialize drag handler
        initializeDragHandler(svg, slider, container, x);

        
    } catch (error) {
        console.error('Errore nel disegno del grafico:', error);
        return null;
    }
}

