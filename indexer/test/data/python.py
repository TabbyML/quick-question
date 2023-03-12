# Function for nth Fibonacci number
def fibonacci(n):
   
    # Check if input is 0 then it will
    # print incorrect input
    if n < 0:
        print("Incorrect input")
 
    # Check if n is 0
    # then it will return 0
    elif n == 0:
        return 0
 
    # Check if n is 1,2
    # it will return 1
    elif n == 1 or n == 2:
        return 1
 
    else:
        return fibonacci(n-1) + fibonacci(n-2)

class Foo(object):
    def __init__(self):
        pass

    def print():
        print("hello world")
