package tests.data;

// Print words with space
fun printWithSpace(words: List<String>) {
    words.forEach {
        print(it)
        print(" ")
    }
}

/**
 * Simple class printing messages.
 */
class Greeter(message: String) {
    val words = listOf(hello, message)

    fun greet() {
        printWithSpace(words);
    }

    companion object {
        val hello = "Hello"
    }
}

/**
 * Class with annotation.
 */
@AnyAnnotation("this")
class Foo() {
}