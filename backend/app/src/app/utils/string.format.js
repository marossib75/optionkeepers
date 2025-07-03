export function capitalize(word = "") {
    return word
      .toLowerCase()
      .replace(/\w/, firstLetter => firstLetter.toUpperCase());
}

export function floatToFixed(value, fix=1) {
  if (value)
    return Number(value).toFixed(fix);
  else
    return 0
}

export function floatToPercentage(value, fix=1) {
  return floatToFixed(value * 100, fix)
}