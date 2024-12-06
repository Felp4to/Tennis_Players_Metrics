// Calcola la distanza tra due tacche consecutive sull'asse Y
const tickDistance = Math.abs(y(ticksY2[1]) - y(ticksY2[0]));
const padding = 5; // Padding tra rettangoli
const rectHeight = tickDistance - padding; // Altezza rettangolo con padding

const rectWidth = 400;  // Larghezza del rettangolo
const rectOffset = 50;  // Distanza dal bordo destro del grafico

// Gestione evento mousemove per verificare la distanza
container.append('rect')
    .attr('width', Constants.widthChart)
    .attr('height', Constants.heightChart)
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
            .attr('transform', d => `translate(${Constants.widthChart + rectOffset}, ${y(d)})`)
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
                .attr('transform', d => `translate(${Constants.widthChart + rectOffset + initialOffset}, ${y(d)})`)  
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


            // Esegui il log dopo aver aggiunto gli elementi
            console.log(container.selectAll('.y-tick-circle').nodes());
            console.log(container.selectAll('.y-y-tick-texxt').nodes());
            console.log(container.selectAll('.y-tick-text-second').nodes());
            
        }

    }).on('mouseout', () => {
        // Ripristina tutti i punti e nasconde i tooltip
        //container.selectAll('.dot')
        //    .attr('r', 4); // Torna alla dimensione normale
        //playerId.text('');
    });


















    // add rect slider to the graph
    const rect = container.append('rect')
        .attr('x', Constants.rectX)
        .attr('y', Constants.rectY)
        .attr('width', Constants.sliderWidth)
        .attr('height', Constants.sliderHeight)
        .attr('rx', 10) 
        .style('fill', 'lightgray') 
        .style('opacity', 0.5) 
        .attr('name', 'rect-slider'); 

    const threshold = 35;
    let previousDate = null; // Per memorizzare la data precedente

    // Aggiungi rettangoli allineati alle tacche dell'asse Y (per esempio)
    const ticksY2 = y.ticks(nPlayers);  // Usa i valori dei tick Y

    const triangle = container.append('polygon')
        .attr('points', `${Constants.triangleX + Constants.triangleWidth / 2},
                        -${Constants.triangleHeight} ${Constants.triangleX},
                        -${Constants.yLowAngle} ${Constants.triangleX - Constants.triangleWidth / 2},
                        -${Constants.triangleHeight}`)
        .style('fill', 'black')
        .attr('name', 'triangle-slider')
        .call(
            d3.drag()
                .on('drag', function (event) {
                    // Trova la data corrispondente alla posizione x dello slider
                    const mouseX = event.x;
                    const closestDate = x.invert(mouseX); // Calcola la data corrispondente alla posizione X

                    // Converte la data in formato yyyy-mm (simile al formato delle etichette sull'asse X)
                    const formattedDate = d3.timeFormat('%Y-%m')(closestDate); // Riformatta la data

                    // Trova la posizione della tacca più vicina sulla scala X
                    const closestX = x(new Date(formattedDate)); // Converti la data formattata nella posizione X corrispondente

                    // Aggiorna la posizione orizzontale del triangolo
                    Constants.triangleX = closestX; // Nuova posizione x del triangolo

                    // Aggiorna i vertici del triangolo
                    d3.select(this)
                        .attr('points', `${triangleX + triangleWidth / 2},-${triangleHeight} ${triangleX},-${yLowAngle} ${triangleX - triangleWidth / 2},-${triangleHeight}`);

                    // Aggiorna la posizione del rettangolo
                    Constants.rectX = triangleX - sliderWidth / 2; // Calcola la nuova posizione x del rettangolo
                    rect.attr('x', rectX); // Aggiorna la posizione x del rettangolo
                })
                .on('end', function (event) {
                    // Quando il drag termina, memorizza la data corrente (alla posizione finale dello slider)
                    const mouseX = event.x;
                    const closestDate = x.invert(mouseX); // Calcola la data corrispondente alla posizione X
                
                    // Se la data è diversa dalla precedente, ingrandisci i pallini vicini
                    if (previousDate === null || previousDate.getTime() !== closestDate.getTime()) {
                        // Trova la posizione della tacca più vicina sulla scala X
                        const formattedDate = d3.timeFormat('%Y-%m')(closestDate); // Riformatta la data
                        const closestX = x(new Date(formattedDate)); // Converti la data formattata nella posizione X
                
                        // Seleziona solo i pallini che si trovano sulla colonna corrispondente alla posizione dello slider
                        container.selectAll('.dot')
                            .filter(function(d) {
                                // Calcola la posizione X di ogni pallino
                                const pointX = x(d.data); // Posizione X del pallino basata sulla sua data
                                return Math.abs(pointX - closestX) < 1; // Se la distanza tra il pallino e lo slider è minima, seleziona il pallino
                            })
                            .transition() // Per animare l'ingrandimento
                            .duration(100) // Durata dell'animazione
                            .attr('r', function (d) {
                                // Calcola la distanza temporale tra la data del punto e la data dello slider
                                const pointDate = d.data; // Data del punto
                                const distance = Math.abs(x(pointDate) - closestX); // Differenza di distanza tra la data del punto e la posizione dello slider  

                                // Se la distanza è minore della soglia, ingrandisci il punto
                                return distance < threshold ? 20 : 4; // Raggio ingrandito se vicino, altrimenti torna normale
                            })
                
                        // Memorizza la nuova data come quella precedente
                        previousDate = closestDate;
                    }
                })
            );