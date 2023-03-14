function logWithDividing(object: any) {

  function log(object: any) {
    // Nested funciton should not be indexed.
    console.log(object);
  }

  const div: string = "------";
  log(div);
  log(object);
}

function shortFunction() {
  // Too short to be indexed.
}

class Greeter {
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
  }

  greet(): string {
    return "Hello, " + this.greeting;
  }
}

let greeter = new Greeter("world");
logWithDividing(greeter.greet());
