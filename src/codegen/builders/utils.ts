function isValidIdentifier(name: string): boolean {
  return /^[a-z_$][a-z0-9_$]*$/i.test(name);
}

function escapePropertyName(name: string): string {
  if (isValidIdentifier(name)) {
    return name;
  }

  return JSON.stringify(name);
}

export { escapePropertyName };
