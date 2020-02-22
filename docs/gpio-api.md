# GPIO API

The API provides access to General Purpose Input and Output (GPIO) pins.

## Constants
Logical level:
```
gpio.HIGH
gpio.LOW
```
Edge selection:
```
gpio.RISING
gpio.FALLING
gpio.ANY
gpio.CANCEL
```
Pin direction:
```
gpio.INPUT
gpio.OUTPUT
```
Pull up/down:
```
gpio.FLOATING
gpio.PULL_UP
gpio.PULL_DOWN
```
Output mode:
```
gpio.PUSH_PULL
gpio.OPEN_DRAIN
```

## Functions

### init
```
gpio.init(pin, mode, conf)
```
- `pin: number`, pin number
- `mode: gpio.INPUT | gpio.OUTPUT`
- `conf: object`, a JS object with optional arguments
  - `pud: gpio.FLOATING | gpio.PULL_UP | gpio.PULL_DOWN`, defaults to `FLOATING`
  - `outputType: gpio.PUSH_PULL | gpio.OPEN_DRAIN`, defaults to `PUSH_PULL` (and only applies when mode is `OUTPUT`)

Sets the settings on the pin. Should be de-initialized with `deinit` (see below) or with another call to `gpio.init`, configuring the new settings.

`OPEN_DRAIN` mode is not directly supported on RPi, it is emulated as described [here](https://www.raspberrypi.org/forums/viewtopic.php?t=118340), initial value being `INPUT/FLOATING`.

### deinit
```
gpio.deinit(pin)
```
- `pin: number`, pin number

Returns the pin to the default state (floating input).

### read
```
gpio.read(pin)
```
- `pin: number`, pin number

returns: `gpio.HIGH | gpio.LOW`, value read from pin  

### write
```
gpio.write(pin, value)
```
- `pin: number`, pin number
- `value: gpio.HIGH | gpio.LOW`, value to write to pin

Current implementation uses RPi registers and has no status check, it is assumed to succeed given functional hardware.

### onchange
```
gpio.onchange(pin, conf)
```
- `pin: number`, pin number
- `conf: object`, a JS object with optional arguments
  - `cancel: boolean`, if true the callback on the pin is removed, other arguments are ignored, false by default
  - `callback: function`, callback executed on every relevant event, if cancel is not set or false - callback must be provided
  - `edge: gpio.RISING | gpio.FALLING | gpio.ANY`, which front to detect, `ANY` by default
  - `initial: bool`, whether to invoke the callback if the pin initially is in the desired state, false by default
  - `debounce: number`, debounce value in ms (see below), 10 by default

The debounce logic is enabled in the following way: pin state is only qualified as valid state if it is steady for at least `<debounce>` ms. 
