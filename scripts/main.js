
// TODO: Once the "submit" action is taken, clear the local storage for that key
// TODO: Make GitHub pages for this extension
// TODO: Post on FaceBook to see if any friends who are teachers would like to test this
function createStatusIcon(wrapper) {
    const statusIcon = document.createElement("img")
    statusIcon.id = "status-icon"
    statusIcon.title = "Saved"
    statusIcon.src = "images/checkmark.svg"
    wrapper.appendChild(statusIcon)
    return statusIcon
}

function setupWrapper(feedbackForm, feedbackTextarea) {
    const wrapper = document.createElement("div")
    wrapper.style.height = "25px"
    wrapper.style.position = "relative"
    wrapper.style.width = "100%"
    wrapper.style.marginTop = "-35px"
    feedbackForm.insertBefore(wrapper, feedbackTextarea.nextSibling)
    return wrapper
}

function debounceImmediate(func, delay, statusIcon) {
    let debounceTimer
    let isCooldown = false
    return function() {
        const context = this
        const args = arguments

        if (!isCooldown) {
            statusIcon.src = "images/saving.svg"
            isCooldown = true
        }

        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
            func.apply(context, args)
            isCooldown = false
            statusIcon.src = "images/checkmark.svg"
        }, delay)
    }
}

function saveFeedback(statusIcon, feedbackTextarea, hashId) {
    const feedback = feedbackTextarea.value
    localStorage.setItem(hashId, feedback)
    const lastSavedTime = new Date().toLocaleTimeString()
    localStorage.setItem(hashId + "_lastSavedTime", lastSavedTime)
    statusIcon.title = "Last saved: " + lastSavedTime
    console.log("Feedback saved at: " + lastSavedTime)
}

const hash = async (id, assignment, className) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(`${id}-${assignment}-${className}`)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
}

const getData = async () => {
    const name = document.getElementById("name") ? document.getElementById("name").innerText : ""
    const assignment = document.getElementById("assignment") ? document.getElementById("assignment").innerText : ""
    const studentId = document.getElementById("studentId") ? document.getElementById("studentId").innerText : ""
    const className = document.getElementById("class") ? document.getElementById("class").innerText : ""

    if (name && studentId && className) {
        const studentIdHash = await hash(studentId, assignment, className)
        return {
            name,
            studentId,
            className,
            assignment,
            hashedId: studentIdHash
        }
    }
    //  TODO: Maybe error handling here
    return null
}

// TODO: Need to check if the url matches the current page, or perhaps only allow this extension to run on bright space pages
const autosaveFeedback = async () => {
    const feedbackForm = document.getElementById("feedbackForm")
    const feedbackTextarea = document.getElementById("feedbackText")
    if (!feedbackForm || !feedbackTextarea) {
        console.error("Form or textarea not found.")
        return
    }
    const data = await getData()
    if (!data) { // TODO: Error handling
        console.log("Required data not found")
        return
    }

    const wrapper = setupWrapper(feedbackForm, feedbackTextarea)
    const statusIcon = createStatusIcon(wrapper)

    // Restore saved feedback
    const hashId = data.hashedId
    const savedFeedback = localStorage.getItem(hashId)
    if (savedFeedback) {
        feedbackTextarea.value = savedFeedback
        const lastSavedTime = localStorage.getItem(hashId + "_lastSavedTime") || "Not yet saved"
        statusIcon.title = "Last saved: " + lastSavedTime
    }

    const debouncedSaveFeedback = debounceImmediate(() => saveFeedback(statusIcon, feedbackTextarea, hashId), 750, statusIcon)
    feedbackTextarea.addEventListener("input", debouncedSaveFeedback)

    // To handle programmatic updates:
    feedbackTextarea.onchange = debouncedSaveFeedback
}

autosaveFeedback().then(_ => console.log("Autosave activated"))
