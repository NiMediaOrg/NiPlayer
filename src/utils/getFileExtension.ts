export function getFileExtension(file: string | File): string | null {
  let name: string;
  if (typeof file === "string") {
    name = file;
  } else {
    name = file.name;
  }

  for (let i = name.length - 1; i >= 0; i--) {
    if (name[i] === ".") {
      return name.slice(i + 1, name.length);
    }
  }
  return null;
}
