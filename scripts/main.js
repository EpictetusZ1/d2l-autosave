



const validateChanges = () => {
    const feedbackTextarea = document.getElementById("feedbackText")
    if (!feedbackTextarea) return

    const savedFeedback = localStorage.getItem("feedback")
    // parse each into JSONString for deep equality check
    return JSON.stringify(feedbackTextarea.value) === JSON.stringify(savedFeedback)

}

function autosaveFeedback() {
    const feedbackTextarea = document.getElementById("feedbackText")
    if (!feedbackTextarea) return

    // Restore previous feedback if it exists
    const savedFeedback = localStorage.getItem("feedback")
    if (savedFeedback) {
        feedbackTextarea.value = savedFeedback
    }

    // Debounce function to limit how often a function can run
    const debounce = (func, delay) => {
        let debounceTimer
        return function() {
            const context = this
            const args = arguments
            clearTimeout(debounceTimer)
            debounceTimer = setTimeout(() => func.apply(context, args), delay)
        }
    }

    // Save feedback to localStorage whenever it changes, no more than once every 2 seconds
    const saveFeedback = () => {
        console.log("Saving feedback")
        localStorage.setItem("feedback", feedbackTextarea.value)
        console.log("Feedback in localStorage: ", localStorage.getItem("feedback"))
    }

    feedbackTextarea.addEventListener("input", debounce(saveFeedback, 2000))
}

const getData = async () => {
    const name = document.getElementById("name") ? document.getElementById("name").innerText : ""
    const studentId = document.getElementById("studentId") ? document.getElementById("studentId").innerText : ""
    const className = document.getElementById("class") ? document.getElementById("class").innerText : ""

    if (name && studentId && className) {
        return {
            name,
            studentId,
            className
        }
    }
    //  TODO: Maybe error handling here
    return null
}

// TODO: Need to check if the url matches the current page, or perhaps only allow this extension to run on bright space pages
const main = async () => {
    document.addEventListener("DOMContentLoaded", async () => {
        const target = document.getElementById("feedbackForm")
        if (!target) {
            console.log("Feedback form not found")
            return
        }

        const data = await getData()
        if (!data) {
            console.log("Required data not found")
            return
        }

        autosaveFeedback()
        console.log("Autosave activated")
    })
}

main()