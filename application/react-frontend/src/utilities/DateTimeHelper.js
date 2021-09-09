export function getNumOfDaysInMonth (dateObject) {
  const month = dateObject.getMonth()
  const year = dateObject.getYear()
  switch (month) {
    case 0:
    case 2:
    case 4:
    case 6:
    case 7:
    case 9:
    case 11:
      return 31
    case 1:
      return isLeapYear(year) ? 29 : 28
    default:
      return 30
  }
}

function isLeapYear (year) {
  return !(year % 4 || (!(year % 100) && year % 400))
}

export function getDateObjFromISOString (ISOTimeString) {
  const prefixes = [1, 2, 3, 4, 5]

  const date = parseTimestamp(ISOTimeString) // parses to miliseconds from start of epoc
  if (isNaN(date)) {
    return {}
  }
  const dateString = date.toString().split(' ', 5)
  const timeOfDay = date.getHours() < 12 ? 'AM' : 'PM'
  let hours = date.getHours()
  hours = hours % 12
  hours = hours || 12 // the hour '0' should be '12'
  let minutes = date.getMinutes()
  minutes = minutes < 10 ? '0' + minutes : minutes
  let seconds = date.getSeconds()
  seconds = seconds < 10 ? '0' + seconds : seconds
  const numOfWeek = prefixes[Math.floor(date.getDate() / 7)]

  return {
    weekday: dateString[0],
    month: dateString[1],
    monthNum: date.getMonth(),
    day: dateString[2],
    numOfWeek: numOfWeek,
    year: dateString[3],
    time: dateString[4],
    timeIn12: `${hours}:${minutes}:${seconds} ${timeOfDay}`,
    timeIn12NoSecs: `${hours}:${minutes} ${timeOfDay}`,
    timeOfDay: timeOfDay
  }

  // 2020-10-12T03:53:34.895Z - ISOString
  // Mon Oct 12 2020 03:53:34 GMT+0000 (Coordinated Universal Time) .toString() format
  // [ 'Mon', 'Oct', '12', '2020', '03:53:34' ] => dateString after split function with limit of 5
}

function parseTimestamp (timestampStr) {
  return new Date(
    new Date(timestampStr).getTime()
  )
  // return new Date(new Date(timestampStr).getTime() + new Date().getTimezoneOffset() * 60 * 1000);
  // return new Date(new Date(timestampStr).getTime());
}
