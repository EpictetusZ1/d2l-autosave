// TODO: Make GitHub pages for this extension
// TODO: Post on FaceBook to see if any friends who are teachers would like to test this


/**
 * Utilities
 */
function formatDate(date) {
    return date.toLocaleTimeString()
}

function isExpired(date) {
    return (new Date() - date) / (1000 * 60 * 60) >= 24
}

function getFeedbackData(hashId) {
    const data = localStorage.getItem(hashId)
    return data ? JSON.parse(data) : null
}

const hash = async (id, assignment, className) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(`${id}-${assignment}-${className}`)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
}

/**
 * DOM manipulation
 */
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
    wrapper.style.cssText = "height: 25px; position: relative; width: 100%; margin-top: -35px;"
    feedbackForm.insertBefore(wrapper, feedbackTextarea.nextSibling)
    return wrapper
}

/**
 * Debouncing function
 */
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

/**
 * Core functionalities
 */
function clearExpiredFeedback() {
    Object.keys(localStorage).forEach(key => {
        const feedbackData = getFeedbackData(key)
        if (feedbackData && isExpired(new Date(feedbackData.lastSaved))) {
            localStorage.removeItem(key)
            console.log(`Removed expired feedback for key: ${key}`)
        }
    })
}

function saveFeedback(statusIcon, feedbackTextarea, hashId) {
    const feedback = feedbackTextarea.value
    const lastSavedTime = new Date()
    const feedbackData = {
        text: feedback,
        lastSaved: lastSavedTime
    }
    localStorage.setItem(hashId, JSON.stringify(feedbackData))
    clearExpiredFeedback()
    statusIcon.title = "Last saved: " + formatDate(lastSavedTime)
    console.log("Feedback saved at: " + formatDate(lastSavedTime))
}

const getPageData = async () => {
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
    return null
}

function clearDataOnSubmit(form, data) {
    form.addEventListener("submit", () => {
        if (getFeedbackData(data.hashedId)) {
            localStorage.removeItem(data.hashedId)
            console.log("Removing data for:", data.hashedId)
        }
    })
}

/**
 * Initialization
 */
async function autosaveFeedback() {
    const feedbackForm = document.getElementById("feedbackForm")
    const feedbackTextarea = document.getElementById("feedbackText")
    if (!feedbackForm || !feedbackTextarea) {
        console.error("Form or textarea not found.")
        return
    }

    const data = await getPageData()
    if (!data) {
        console.error("Required data not found")
        return
    }

    clearDataOnSubmit(feedbackForm, data)
    const wrapper = setupWrapper(feedbackForm, feedbackTextarea)
    const statusIcon = createStatusIcon(wrapper)
    const hashId = data.hashedId
    const feedbackData = getFeedbackData(hashId)

    if (feedbackData) {
        feedbackTextarea.value = feedbackData.text
        statusIcon.title = "Last saved: " + formatDate(new Date(feedbackData.lastSaved))
    }

    const debouncedSaveFeedback = debounceImmediate(() => saveFeedback(statusIcon, feedbackTextarea, hashId), 750, statusIcon)
    feedbackTextarea.addEventListener("input", debouncedSaveFeedback)
    feedbackTextarea.onchange = debouncedSaveFeedback
}

autosaveFeedback().then(() => console.log("Autosave initialized."))
