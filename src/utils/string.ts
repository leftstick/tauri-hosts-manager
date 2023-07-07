export function preprocessEmptySpace(str: string) {
  const replaced = str.replace(/\s/g, ' ');
  return replaced.trim();
}
