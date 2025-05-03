export function arrayCheck(value: string) {
  // Array check
  try {
    const arrayPattern = /'([^']*)'/g;
    const parsedArray = JSON.parse(value.replace(arrayPattern, '"$1"'));

    if (Array.isArray(parsedArray)) {
      return parsedArray;
    }

    // if not array, return string
    return value;
  } catch (err) {
    // if JSON.parse fails, return the value as is, in string
    return value;
  }
}
