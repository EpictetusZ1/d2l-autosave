
function incrementNumbers() {
    let count = 0
    const feedbackTextarea = document.getElementById('feedbackText')
    if (!feedbackTextarea) return

    const intervalId = setInterval(() => {
        // append the text with a space then the next number
        feedbackTextarea.value += ` ${count}`

        count++
        if (count > 500) {
            clearInterval(intervalId)
        }
    }, 2000)
}

// document.addEventListener('DOMContentLoaded', incrementNumbers)
