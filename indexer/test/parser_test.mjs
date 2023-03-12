import path from "path";
import assert from "assert";
import { parseFile } from "../parser.mjs";

describe("parseFile", function () {
  it("should success", async function () {
    const chunks = await parseFile("./test/data/python.py");
    assert.equal(chunks.length, 2);
    assert.match(chunks[0].code, /def fib.*/);
    assert.match(chunks[1].code, /class Foo.*/);
  });
});
