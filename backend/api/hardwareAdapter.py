import RPi.GPIO as GPIO
import sys
import time
import json
from os.path import exists

# -----------------------------------------
# ----------------------------------------- DEFINE PINS
# -----------------------------------------
firePins = [
    3,  # GPIO 2 || channel 1
    5,  # GPIO 3 || channel 2
    7,  # GPIO 4 || channel 3
    11,  # GPIO 17 || channel 4
    13,  # GPIO 27 || channel 5
    15,  # GPIO 22 || channel 6
    19,  # GPIO 10 || channel 7
    21,  # GPIO 9 || channel 8
    23,  # GPIO 11 || channel 9
    29,  # GPIO 5 || channel 10
    31,  # GPIO 6 || channel 11
    33,  # GPIO 13 || channel 12
    35,  # GPIO 19 || channel 13
    37,  # GPIO 26 || channel 14
    12,  # GPIO 18 || channel 15
    16,  # GPIO 23 || channel 16
    18,  # GPIO 24 || channel 17
    22,  # GPIO 25 || channel 18
    32,  # GPIO 12 || channel 19
    36,  # GPIO 16 || channel 20
]

# prepare args, remove first arg (script name)
args = sys.argv
args.pop(0)

# -----------------------------------------
# ----------------------------------------- FUNCTIONS
# -----------------------------------------


# cleanup GPIO pins && exit script with defined error code
def exitSave(exitCode=0):
    GPIO.cleanup()
    sys.exit(exitCode)


# setup GPIO pins
def configureGPIO():
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BOARD)

    # configure fire pins
    for pin in firePins:
        GPIO.setup(pin, GPIO.OUT)
        GPIO.output(pin, GPIO.HIGH)


# fire a single GPIO pin
def firePin(pinNr):
    GPIO.output(pinNr, GPIO.LOW)
    time.sleep(0.5)
    GPIO.output(pinNr, GPIO.HIGH)


# fire all GPIO pins at once
def fireAllPins():
    # enable pins
    for pin in firePins:
        GPIO.output(pin, GPIO.LOW)

    time.sleep(0.5)

    # disable pins
    for pin in firePins:
        GPIO.output(pin, GPIO.HIGH)


# fire a sequence from JSON configuration
def fireSequence(sequenceId):
    """
    Fire a sequence based on configuration stored in JSON file.
    Expects sequences.json with structure:
    {
      "sequence_1": [
        {"type": "channel", "value": "1"},
        {"type": "delay", "value": "500"},
        {"type": "channel", "value": "2"}
      ]
    }
    """

    # Read configuration file
    configFile = "/var/www/html/sequences.json"

    if not exists(configFile):
        print("Configuration file not found")
        exitSave(1)

    try:
        with open(configFile, "r") as f:
            config = json.load(f)

    except Exception as e:
        print("Error reading configuration: " + str(e))
        exitSave(1)

    # Check if sequence exists
    if sequenceId not in config:
        print("Sequence not found")
        exitSave(1)

    sequence = config[sequenceId]

    # Execute sequence
    try:
        for step in sequence:
            if step["type"] == "channel":
                channelNum = int(step["value"])
                if channelNum <= 0 or channelNum > len(firePins):
                    print("Invalid channel number: " + str(channelNum))
                    exitSave(1)

                pin = firePins[channelNum - 1]
                firePin(pin)

            elif step["type"] == "delay":
                delayMs = int(step["value"])
                time.sleep(delayMs / 1000.0)

    except Exception as e:
        print("Error executing sequence: " + str(e))
        exitSave(1)


# -----------------------------------------
# ----------------------------------------- SCRIPT
# -----------------------------------------

configureGPIO()

# check the arguments provided
if len(args) == 1:
    if args[0] == "fireall":
        fireAllPins()
        exitSave(0)

    else:
        print(
            "Please provide a valid option 'fireall' or 'fire <channel>' or 'firesequence <sequence_id>'"
        )
        exitSave(1)

elif len(args) == 2:
    if args[0] == "fire":
        if not args[1].isdigit():
            print("Please provide a number between 1 and {}".format(len(firePins)))
            exitSave(1)

        if int(args[1]) > len(firePins) or int(args[1]) <= 0:
            print("Please provide a number between 1 and {}".format(len(firePins)))
            exitSave(1)

        pin = firePins[int(args[1]) - 1]
        firePin(pin)
        exitSave(0)

    elif args[0] == "firesequence":
        sequenceId = args[1]
        fireSequence(sequenceId)
        exitSave(0)

    else:
        print(
            "Please provide a valid option 'fireall' or 'fire <channel>' or 'firesequence <sequence_id>'"
        )
        exitSave(1)

else:
    print(
        "Please provide a valid option 'fireall' or 'fire <channel>' or 'firesequence <sequence_id>'"
    )
    exitSave(1)
