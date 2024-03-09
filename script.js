let currentScenario = 1; // Initial scenario

function chooseOption(option) {
    switch (currentScenario) {
        case 1:
            updateDisplay("You cast your line into the calm waters.");
            switch (option) {
                case 1:
                    updateDisplay("You feel a tug on the line. Pull it in to see what you've caught!");
                    break;
                case 2:
                    updateDisplay("The water ripples, but nothing bites. Try again.");
                    break;
                // Add more cases for other options
            }
            break;

        // Add more scenarios and options as needed

        default:
            updateDisplay("Thanks for playing!");
            break;
    }
}

function updateDisplay(message) {
    const display = document.getElementById("display");
    display.textContent = message;
}
