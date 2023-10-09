/**
 * @throws an error if the string is empty
 */
export const capitalizeFirstLetter = (s: string) => {
    if (!s.length) throw new Error('String is empty');
    return s.charAt(0).toUpperCase() + s.slice(1);
}
export const snakeCaseToText = (s: string) => s.replace("_", " ");