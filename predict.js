
const resultField = document.getElementById('result');
const predictBtn = document.getElementById('predictBtn').addEventListener("click", function() {makePrediction()});
const yearInput = document.getElementById("year");
const transmissionInput = document.getElementById("transmission");
const mileageInput = document.getElementById("mileage");
const fuelTypeInput = document.getElementById("fuelType");
const mpgInput = document.getElementById("mpg");
const engineSizeInput = document.getElementById("engineSize");
const errorField = document.getElementById('errorField');

const nn = ml5.neuralNetwork({ task: 'regression', debug: true })
nn.load('./model/model.json', modelLoaded)

function modelLoaded() {
    console.log("Model loaded!")
}

async function makePrediction() {
    errorField.innerHTML = ""

    const predictionValues = {
        year: parseInt(yearInput.value, 10),
        transmission: parseInt(transmissionInput.value, 10),
        mileage: parseInt(mileageInput.value, 10),
        fuelType: parseInt(fuelTypeInput.value, 10),
        mpg: parseInt(mpgInput.value, 10),
        engineSize: parseInt(engineSizeInput.value, 10)
    }

    const results = await nn.predict(predictionValues);

    if (isNaN(results[0].price)) {
        errorField.innerHTML = "Something went wrong. Please try again!"
    } else {
        console.log(`Geschatte Verkoop Prijs: ${results[0].price}`)
        currencyTransformer(results[0].price);
    }
}

function currencyTransformer(result) {
    const fmt = new Intl.NumberFormat('us-US', { style: 'currency', currency: 'USD' });
    resultField.innerHTML = "Geschatte Verkoop Prijs: " + fmt.format(result);
}