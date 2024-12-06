
// width and height of svg
export const svgWidth = 1500;
export const svgHeight = 600;
// margin graph
export const margin = { top: 50, right: 30, bottom: 50, left: 50 };
export const percentageWidthGraph = 0.65;
// define size of line charts graphic
export const widthChart = svgWidth * percentageWidthGraph - margin.left - margin.right;  
export const heightChart = svgHeight - margin.top - margin.bottom;  
// size of triangle
export const triangleHeight = 65;                               // Altezza del triangolo
export const yLowAngle = 35;                                    // Posizione del vertice inferiore del triangolo
export const triangleWidth = 40;                                // Larghezza del triangolo (base)
export let triangleX = 0;                                       // Posizione iniziale del triangolo sull'asse X    
// size of rectangle
export const sliderWidth = 65;                                  // Larghezza totale del rettangolo
export const sliderHeight = heightChart + 70;                   // Altezza del rettangolo
export let rectX = -sliderWidth / 2;                            // Posizione iniziale del rettangolo
export const rectY = -sliderWidth / 2;                          // Inizia dalla cima del grafico
// forlder images
export const imagesPlayersFolder = './assets/images';
// circles
export const radiusNormal = 4;
export const radiusHover = 8;
export const hoverDistance = 20;