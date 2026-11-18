export function workspaceUri(rootPath, directory) {
  const encoded = rootPath.split("/").map((segment, index) => {
    if (index === 0 && /^[a-z]:$/i.test(segment)) return segment;
    return encodeURIComponent(segment);
  }).join("/");
  const absolutePath = encoded.startsWith("/") ? encoded : "/" + encoded;
  return "vscode://file" + absolutePath.replace(/\/+$/, "") + "/" + directory + "/";
}
