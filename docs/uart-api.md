# UART API

The API provides access to Universal Asynchronous Receiver Transmitter (UART), often referred to as a serial port.

## Basic usage

In the basic case, the API is intended for implementation of a text-based protocol over the serial port. 
Transactions are handled line by line, separated by `\n` character.

Supported UART mode: 8-bit, no parity check, 1 stop bit, with baudrate selected from the following standard values:
1200, 1800, 2400, 4800, 9600, 19200, 38400, 57600, 115200, 230400, 460800, 500000, 576000, 921600, 1000000.

----
- API methods
    - [`open()`](#openbaudrate-rxcallback-txcallback)
    - [`UartPort.write()`](#uartportwritedata)
    - [`UartPort.close()`](#uartportclose)
----

### `open(port, baudrate, conf)`
Initializes and opens the serial port. The method returns a UartPort object.
- `port: number`, serial port number. At this moment only the value of 0 is supported, which corresponds to primary UART on Raspberry Pi, available at `/dev/serial0`.
- `baudrate: number`, one of the supported baudrate values.
- `conf: object`, a JS object with optional arguments:
  - `rxCallback: function`, a callback function that is called every time a newline is received from serial port (optional);
  - `txCallback: function`, a callback function that is called every time the data is pushed out to serial port buffer (optional);
When received data is provided to `rxCallback`, newline `\n` and carriage return `\r` characters are dropped.

### `UartPort.write(data)`
Writes `data` to the port.
All ending newline `\n` and carriage return `\r` characters are automatically stripped and a single `\n` is added.

### `UartPort.close()`
Closes the port.

## Advanced usage

Advanced usage, including non-standard UART modes and binary protocols, is in the roadmap for future development.
