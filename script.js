document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("loginButton");
    const desktop = document.getElementById("desktop");
    const loginScreen = document.getElementById("loginScreen");
    const shutdownButton = document.getElementById("shutdown");
    const errorMessage = document.getElementById("errorMessage");
    const blueScreen = document.getElementById("blueScreen");
    const progress = document.getElementById("progress");
    const clock = document.getElementById("clock");

    let errorTriggered = false;
    let shutdownStarted = false;

    loginButton.addEventListener("click", () => {
        loginScreen.style.display = "none";
        desktop.style.display = "block";
        startGame();
    });

    function startGame() {
        updateClock();
        setInterval(updateClock, 1000);
        setTimeout(triggerError, 5000);
    }

    function updateClock() {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString();
    }

    function triggerError() {
        if (!errorTriggered) {
            errorTriggered = true;
            errorMessage.style.display = "block";
            setTimeout(() => { errorMessage.style.display = "none"; }, 3000);
            setTimeout(triggerBlueScreen, 15000);
        }
    }

    function triggerBlueScreen() {
        if (!shutdownStarted) {
            shutdownStarted = true;
            blueScreen.style.display = "flex";
            let progressValue = 0;
            const interval = setInterval(() => {
                progressValue += Math.floor(Math.random() * 10);
                if (progressValue >= 100) {
                    progress.textContent = "100%";
                    clearInterval(interval);
                    setTimeout(() => {
                        window.close();
                    }, 1000);
                } else {
                    progress.textContent = progressValue + "%";
                }
            }, 1000);
        }
    }

    shutdownButton.addEventListener("click", () => {
        setTimeout(triggerBlueScreen, 2000);
    });
});
