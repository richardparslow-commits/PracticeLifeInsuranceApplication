import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { expect, it } from "vitest";

it("resolves the worksheet Edge Function module graph with explicit Deno file extensions", () => {
  // Node/Vite accepts extensionless imports that the production Deno loader
  // rejects. Check the real entry point and every transitive relative import.
  const root = path.resolve("supabase/functions/send-practice-application");
  const imports = JSON.parse(
    readFileSync(path.join(root, "deno.json"), "utf8"),
  ).imports;
  const visited = new Set<string>();
  function visit(file: string) {
    if (visited.has(file)) return;
    visited.add(file);
    expect(existsSync(file), `Missing Edge module ${file}`).toBe(true);
    const source = readFileSync(file, "utf8");
    for (const { fileName: specifier } of ts.preProcessFile(source)
      .importedFiles) {
      if (specifier.startsWith(".")) {
        expect(
          specifier,
          `${file}: Deno requires an explicit extension`,
        ).toMatch(/\.(?:ts|tsx|js|mjs)$/);
        visit(path.resolve(path.dirname(file), specifier));
      } else if (!/^(?:https?:|npm:|jsr:|node:)/.test(specifier)) {
        expect(
          imports[specifier],
          `${file}: missing import-map entry for ${specifier}`,
        ).toBeDefined();
      }
    }
  }
  visit(path.join(root, "index.ts"));
  expect(
    visited.has(path.resolve(root, "../_shared/prepareApplication.ts")),
  ).toBe(true);
  expect(
    visited.has(path.resolve(root, "../_shared/practiceApplication.schema.ts")),
  ).toBe(true);
});
