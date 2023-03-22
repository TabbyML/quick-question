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

describe("parseFile: java", function () {
  it("should success", async function () {
    const chunks = await parseFile("./tests/data/java.java");
    assert.equal(chunks.length, 1);
    assert.ok(
      chunks[0].code.startsWith(
        '/**\n * Simple class printing messages.\n */\n@AnyAnnotation("this")\npublic class Greeter'
      )
    );
    assert.ok(chunks[0].code.endsWith("}"));
  });
});

describe("parseFile: kotlin", function () {
  it("should success", async function () {
    const chunks = await parseFile("./tests/data/kotlin.kt");
    assert.equal(chunks.length, 3);
    assert.ok(
      chunks[0].code.startsWith("// Print words with space\nfun printWithSpace")
    );
    assert.ok(chunks[0].code.endsWith("}"));
    assert.ok(
      chunks[1].code.startsWith(
        "/**\n * Simple class printing messages.\n */\nclass Greeter"
      )
    );
    assert.ok(chunks[1].code.endsWith("}"));
    assert.ok(
      chunks[2].code.startsWith(
        '/**\n * Class with annotation.\n */\n@AnyAnnotation("this")\nclass Foo'
      )
    );
    assert.ok(chunks[2].code.endsWith("}"));
  });
});
