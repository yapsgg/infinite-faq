import { readFile, writeFile } from "node:fs/promises"

const targets = ["dist/index.js", "dist/index.cjs"]
const directive = '"use client";\n'

for (const file of targets) {
  let contents
  try {
    contents = await readFile(file, "utf8")
  } catch {
    continue
  }

  if (!contents.startsWith('"use client"')) {
    await writeFile(file, directive + contents)
  }
}

console.log("postbuild: added use client directive")
