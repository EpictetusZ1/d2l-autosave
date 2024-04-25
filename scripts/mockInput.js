
function incrementNumbers() {
    let count = 0
    const feedbackTextarea = document.getElementById('feedbackText')
    if (!feedbackTextarea) return

    const intervalId = setInterval(() => {
        feedbackTextarea.value += ` ${count}`
        const event = new Event('input', { bubbles: true });
        feedbackTextarea.dispatchEvent(event);  // Dispatch the event to trigger autosave
        count++
        if (count > 500) {
            clearInterval(intervalId)
        }
    }, 2000)
}
