import fs from 'fs';
import { createInterface } from 'readline';

const processStartTime = process.hrtime();

// Initializing read and write streams 
let wordsToFind = fs.readFileSync('./find_words.txt').toString('utf8');
const dictionaryFile = fs.createReadStream('./french_dictionary.csv');
const frequencyFile = fs.createWriteStream('./frequency.csv');
const performanceFile = fs.createWriteStream('./performance.txt');
const outputFile = fs.createWriteStream('./output.txt');

// Main Higher order process 
(async()=>{
    try {
        const output = await processLineByLine();
        outputFile.write(output);
        let processEndTime = process.hrtime(processStartTime);
        performanceFile.write(`Time to process: ${processEndTime[0] * 60} minutes ${(processEndTime[1] / 100000000).toFixed(0)} seconds\n`);
        performanceFile.write(`Memory used: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0)} MB`);        
    } catch (error) {
        console.log(error);
        return null;
    }
})();

// Process each lines in dictionary and compare with words_to_find contents
async function processLineByLine(){
    const rl = createInterface({
        input: dictionaryFile,
        crlfDelay: Infinity
    });

    for await(const line of rl){
        let currentWord = line.split(',');
        let regx = new RegExp('\\b' + currentWord[0] + '\\b', 'g');
        let foundCount = wordsToFind.split(',')[0].match(regx).length;                  // matching only engligh words to find multiple occurrence
        wordsToFind = wordsToFind.replace(regx, currentWord[1], 'g');
        frequencyFile.write(`${currentWord[0]},${currentWord[1]},${foundCount}\n`);
    }

    return wordsToFind;
}