export function getFormattedTimeString(timeInSecs) {
    if (timeInSecs < 60) {
        return `00:${getCorrectNumericTimeText(timeInSecs)}`;
    }
    else if (timeInSecs < 3600) {
        const mins = Math.floor(timeInSecs / 60);
        const secs = timeInSecs - mins * 60;
        return `${getCorrectNumericTimeText(mins)}:${getCorrectNumericTimeText(secs)}`
    } else {
        const hour = Math.floor(timeInSecs / 3600);
        timeInSecs -= hour * 3600;
        const mins = Math.floor(timeInSecs / 60);
        const secs = Math.round(timeInSecs - mins * 60);
        return `${getCorrectNumericTimeText(hour)}:${getCorrectNumericTimeText(mins)}:${getCorrectNumericTimeText(secs)}`;
    }
}

export function getCorrectNumericTimeText(time) {
    return time < 10 ? "0" + Math.round(time) : Math.round(time);
}
