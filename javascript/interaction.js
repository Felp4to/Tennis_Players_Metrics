// interaction.js

import * as Constants from './constants.js';
import { Cursor } from './cursor.js';
import { convertToYYYYMM } from './utils.js';


// get closest date
function getClosestTick(x, xPos) {
    // Ottieni tutte le tacche dell'asse X
    const ticks = x.ticks(); // Restituisce un array di Date
    
    // Converti la posizione X in una data usando la scala inversa
    const xDate = x.invert(xPos);

    // Trova la tacca più vicina usando reduce
    return ticks.reduce((prev, curr) => {
        return Math.abs(curr - xDate) < Math.abs(prev - xDate) ? curr : prev;
    });
} 

function updateSliderPosition(slider, newPosition)
{
    slider.triangle.attr('points', `${newPosition + Constants.triangleX + Constants.triangleWidth / 2},
                            -${Constants.triangleHeight} ${Constants.triangleX + newPosition},
                            -${Constants.yLowAngle} ${newPosition + Constants.triangleX - Constants.triangleWidth / 2},
                            -${Constants.triangleHeight}`);

    slider.rect.attr('x', Constants.rectX + newPosition);
}

// Funzione per inizializzare il drag handler
export function initializeDragHandler(svg, slider, container, x) {
    const dragHandler = d3.drag()
        .on('drag', (event) => {
            svg.selectAll(".dot")
                .attr("r", Constants.radiusNormal);

            // Calcola la nuova posizione lungo l'asse x
            const newX = event.x;

            // Limita la posizione X tra 0 e il range definito
            const clampedX = Math.max(0, Math.min(newX, Constants.widthChart));

            // Aggiorna la posizione del triangolo e del rettangolo in tempo reale
            updateSliderPosition(slider, clampedX);
        })
        .on('end', (event) => {
            // Ottieni la tacca più vicina alla posizione finale del mouse
            const closestTick = getClosestTick(x, event.x);

            // Posiziona il triangolo e il rettangolo sulla tacca più vicina
            const closestTickX = x(closestTick);

            // Rimuovi immagine precedente se esiste
            svg.selectAll(".dot")
                .each(function () {
                    d3.select(this.parentNode)
                        .selectAll("image.img-player")
                        .remove();
                });

            Cursor.dateSlider = closestTick; // Aggiorna stato dello slider
            console.log("Posizione Slider:", convertToYYYYMM(Cursor.dateSlider));

            updateSliderPosition(slider, closestTickX);

            // Trova e aggiorna i cerchi con la classe corrispondente alla data
            const tickString = d3.timeFormat('%Y-%m')(closestTick);

            container.selectAll('.date-' + tickString)
                .transition()
                .duration(150)
                .attr('r', 20)
                .on('end', function () {
                    const circle = d3.select(this);
                    const classList = circle.attr('class').split(' ');
                    const imageClass = classList[1].substring(7);
                    const imagePath = `../assets/images/${imageClass}.png`;
                    const defaultImagePath = "../assets/images/00000.png";

                    function appendImage(src) {
                        container.append('image')
                            .attr('xlink:href', src)
                            .attr('class', `img-player player-${imageClass}`)
                            .attr('width', 40)
                            .attr('height', 40)
                            .attr('x', circle.attr('cx') - 20)
                            .attr('y', circle.attr('cy') - 20);
                    }

                    fetch(imagePath, { method: 'HEAD' })
                        .then(response => {
                            if (response.ok) {
                                appendImage(imagePath);
                            } else {
                                appendImage(defaultImagePath);
                            }
                        })
                        .catch(() => {
                            appendImage(defaultImagePath);
                        });
                });
        });

    // Associa il drag handler allo slider o a un elemento specifico
    slider.rect.call(dragHandler);
    slider.triangle.call(dragHandler);
}




















