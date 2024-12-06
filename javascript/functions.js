// functions.js

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