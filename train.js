import { createChart, updateChart } from "./scatterplot.js"

let saveBtn = document.getElementById('saveBtn');

//
// csv data
//
function loadData(){
    Papa.parse("./data/ford.csv", {
        download:true,
        header:true,
        dynamicTyping:true,
        complete: results => checkData(results.data)
    })
}

function checkData(data) {
    // shuffle & split
    data.sort(() => (Math.random() - 0.5))
    let trainData = data.slice(0, Math.floor(data.length * 0.8))
    let testData = data.slice(Math.floor(data.length * 0.8) + 1)

    const chartdata = trainData.map(car => ({
        x: car.mileage,
        y: car.price,
    }))

    // kijk hoe de data eruit ziet
    console.log(chartdata)

    // chartjs aanmaken
    createChart(chartdata, "mileage", "price")

    neuralNetwork(trainData, testData);
}

function neuralNetwork(trainData, testData) {
    //
    // Neural Network
    //
    const nn = ml5.neuralNetwork({ task: 'regression', debug: true })
    
    // een voor een de data toevoegen aan het neural network
    for (let car of trainData) {
        nn.addData({ year: car.year, transmission: car.transmission, mileage: car.mileage, fuelType: car.fuelType, tax: car.tax, mpg: car.mpg, engineSize: car.engineSize }, { price: car.price })
    }

    // normalize
    nn.normalizeData()
    
    nn.train({ epochs: 6 }, () => finishedTraining(nn, testData)) 
}

async function finishedTraining(nn, testData){
    console.log("Finished training!")

    saveBtn.addEventListener("click", function() {saveModel(nn)});

    makePrediction(nn, testData);
}

async function makePrediction(nn, testData) {
    console.log("Making prediction..")
    
    const testCar = { year: testData[0].year, transmission: testData[0].transmission, mileage: testData[0].mileage, fuelType: testData[0].fuelType, mpg: testData[0].mpg, engineSize: testData[0].engineSize }
    const results =  await nn.predict(testCar);
    console.log(`Geschatte Prijs: ${results[0].price}`)

    let predictions = []
    for (let i = 0; i < testData.length; i += 1) {
        const prediction = await nn.predict({ year: testData[i].year, transmission: testData[i].transmission, mileage: testData[i].mileage, fuelType: testData[i].fuelType, mpg: testData[i].mpg, engineSize: testData[i].engineSize })
        predictions.push({x: testData[i].mileage, y: prediction[0].price})
    }
    
    updateChart("Predictions", predictions)
}

function saveModel(nn) {
    nn.save()
}

// load data
loadData();