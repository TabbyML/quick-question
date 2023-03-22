import path from "path";
import assert from "assert";
import { parseFile } from "../src/parser";

describe("parseFile: python", function () {
  it("should success", async function () {
    const chunks = await parseFile("./tests/data/python.py");
    assert.equal(chunks.length, 2);
    assert.match(chunks[0].code, /def fib.*/);
    assert.match(chunks[1].code, /class Foo.*/);
  });
});

describe("parseFile: typescript", function () {
  it("should success", async function () {
    const chunks = await parseFile("./tests/data/typescript.ts");
    assert.equal(chunks.length, 3);
    assert.match(chunks[0].code, /function logWithDividing.*/);
    assert.match(chunks[1].code, /class Greeter.*/);
    assert.ok(
      chunks[2].code.startsWith(
        "/**\n * This comment should be included.\n */\nfunction functionWithComment"
      )
    );
    assert.ok(chunks[2].code.endsWith(";\n}"));
  });
});

describe("parseFile: tsx", function () {
  it("should success", async function () {
    const chunks = await parseFile("./tests/data/tsx.tsx");
    assert.equal(chunks.length, 2);
    assert.match(chunks[0].code, /function BarComponent.*/);
    assert.match(chunks[1].code, /class ContainerComponent.*/);
  });
});
