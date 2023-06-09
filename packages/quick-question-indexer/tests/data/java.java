package tests.data;

/**
 * Simple class printing messages.
 */
@AnyAnnotation("this")
public class Greeter {
    String hello = "Hello ";

    /**
     * Print greeting message.
     * @param message
     */
    public void greet(String message) {
        System.out.println(hello + message);
    }
}

public class Ignore {
}