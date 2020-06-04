# GPIO API

The API provides access to General Purpose Input and Output (GPIO) pins.

----
- API methods
    - [`open()`](#openpin-mode-conf)
    - [`GpioPin.read()`](#gpioread)
    - [`GpioPin.write()`](#gpiowritevalue)
    - [`GpioPin.onChange()`](#gpioonchangeconf)
    - [`GpioPin.close()`](#gpioclose)
----

### Constants
Logical level:
```
HIGH
LOW
```
Edge selection:
```
RISING
FALLING
ANY
CANCEL
```
Pin direction:
```
INPUT
OUTPUT
```
Pull up/down:
```
FLOATING
PULL_UP
PULL_DOWN
```
Output mode:
```
PUSH_PULL
OPEN_DRAIN
```

### `open(pin, mode, conf)`
Initializes a GPIO pin as input or output with a specified configuration. Returns a GpioPin object.
- `pin: number`, pin number;
- `mode: INPUT | OUTPUT`;
- `conf: object`, a JS object with optional arguments:
  - `pud: FLOATING | PULL_UP | PULL_DOWN`, defaults to `FLOATING`;
  - `outputType: PUSH_PULL | OPEN_DRAIN`, defaults to `PUSH_PULL` (and only applies when mode is `OUTPUT`).

### `GpioPin.read()`
Returns `HIGH` or `LOW` depending on a state of the pin.  

### `GpioPin.write(value)`
Sets the state of the pin to a specific value.

### `GpioPin.onChange(conf)`
Assigns a callback to be executed at events of pin state change.
- `conf: object`, a JS object with optional arguments:
  - `cancel: boolean`, if true the callback on the pin is removed, other arguments are ignored, false by default;
  - `callback: function`, callback executed on every relevant event, if cancel is not set or false - callback must be provided. The argument to the function indicates the pin state, `HIGH` or `LOW`;
  - `edge: RISING | FALLING | ANY`, which front to detect, `ANY` by default
  - `initial: bool`, whether to invoke the callback if the pin initially is in the desired state, false by default;
  - `debounce: number`, debounce value in ms (see below), 10 by default.

The debounce logic is enabled in the following way: pin state is only qualified as valid state if it is steady for at least `<debounce>` ms. 

### `GpioPin.close()`
Returns the pin to the default state of a floating input.

## Notes
`OPEN_DRAIN` mode is not directly supported on RPi, it is emulated as described [here](https://www.raspberrypi.org/forums/viewtopic.php?t=118340), initial value being `INPUT/FLOATING`.
