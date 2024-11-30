// fetchData.js

export async function fetchJSONData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Errore nel caricamento dei dati: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}


// Funzione per caricare e restituire il JSON da un URL di un file CSV
export async function loadCsvFromUrl(url) {
    try {
        const response = await fetch(url); // Usando 'await' per attendere la risposta
        const csv = await response.text(); // Otteniamo il testo del CSV
        const json = csvToJson(csv); // Converto il CSV in JSON
        return json; // Restituisco il JSON
    } catch (error) {
        console.error('Errore nel caricamento del CSV:', error);
        return null; // Se c'è un errore, restituisco null
    }
}

// Funzione per convertire il CSV in JSON
function csvToJson(csv) {
    const lines = csv.split("\n");
    const result = [];
    const headers = lines[0].split(",");
    
    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentLine = lines[i].split(",");
        
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentLine[j];
        }
        
        result.push(obj);
    }
    return result;
}