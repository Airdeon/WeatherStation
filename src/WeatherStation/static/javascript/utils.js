// This script is released to the public domain and may be used, modified and
// distributed without restrictions. Attribution not necessary but appreciated.
// Source: https://weeknumber.com/how-to/javascript

// Returns the ISO week of the date.
Date.prototype.getWeek = function () {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
        - 3 + (week1.getDay() + 6) % 7) / 7);
}

function get_UTC_datetime_string(date) {
    return date.getUTCFullYear() + '-' + (date.getUTCMonth() + 1) + '-' + date.getUTCDate() + "T" + date.getUTCHours() + ":" + date.getUTCMinutes() + ":" + date.getUTCSeconds();
}


function average(array) {
    let sum = 0;
    for (value of array) {
        sum += value;
    }
    return sum / array.length;
}

function get_full_datetime_string(date) {
    let real_date = new Date(date)
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

function get_hours_minutes_string(date) {
    let real_date = new Date(date)
    return real_date.getHours() + ":" + real_date.getMinutes()
}

function get_hour_string(date) {
    let real_date = new Date(date)
    return real_date.getHours() + "H"
}

function get_day_month_string(date) {
    let real_date = new Date(date)
    return real_date.getDate() + "/" + (real_date.getMonth() + 1)
}

function get_month_year_string(date) {
    let real_date = new Date(date)
    return (real_date.getMonth() + 1) + "/" + real_date.getFullYear()
}