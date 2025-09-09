import random

def startguessing(start, end):
    secret = random.randint(start, end)
    attempts = 0
    
    print(f"I've thought of a number between {start} and {end}.")
    print("Try to guess it!")
    
    while True:
        attempts += 1
        user_input = input(f"Attempt {attempts}: Enter your guess: ")
        
        if not user_input:
            print("Empty input, try again!")
            attempts -= 1
            continue
        
        try:
            guess = int(user_input)
        except ValueError:
            print("Invalid input. Please enter a whole number.")
            attempts -= 1
            continue
        except EOFError:
            print(f"Quitting the game. The number was {secret}")
            break
        
        if guess < start or guess > end:
            print(f"Please guess a number between {start} and {end}.")
            attempts -= 1
        elif guess < secret:
            print(f"Too low! ({guess})")
        elif guess > secret:
            print(f"Too high! ({guess})")
        else:
            print(f"Congratulations! You guessed the number {secret} correctly in {attempts} attempts! 🎉")
            break

def main():
    startguessing(1, 100)


if __name__ == "__main__":
    main()
