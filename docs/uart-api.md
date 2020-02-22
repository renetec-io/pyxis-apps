# UART API

The API provides access to Universal Asynchronous Receiver Transmitter (UART), often referred to as a serial port.

## Basic usage

In the basic case, the API is intended for implementation of a text-based protocol over the serial port. 
Transactions are handled line by line, separated by `\n` character.

Supported UART mode: 8-bit, no parity check, 1 stop bit, with baudrate selected from the following standard values:
1200, 1800, 2400, 4800, 9600, 19200, 38400, 57600, 11520, 230400, 460800, 500000, 576000, 921600, 1000000.

### Opening port

To initialize and open serial port, call
```
uart.init(baudrate, rxCallback, txCallback)
```
- `baudrate: number` - one of the supported baudrate values
- `rxCallback: function` - a callback function that is called every time a new line is received from serial port (optional)
- `txCallback: function` - a callback function that is called every time the data is pushed out to serial port buffer (optional)

### Receiving data

Every time a new line of text is received, `rxCallback(data)` function is called with received data, excluding new line `\n` and carriage return `\r` characters.

### Transmitting data

To transmit a line of text, call
```
uart.write(data)
```
- `data: string`, data to transmit. All, if any, new line `\n` and carriage return `\r` characters in the end are automatically stripped and single `\n` is added. Any such characters in the middle are not changed.

### Closing port

Once port is no longer needed, it can be closed with the following call:
```
uart.deinit()
```
The call must happen from the same HTML frame where call to `init()` happened. If the frame is unloaded, including during page reload, the port is closed automatically.

Keep in mind, that because of the asynchronous nature of JavaScript API, some input/output may still be ongoing at the time of `deinit()` call, and provided callback functions will still be called once it is finished. 

## Advanced usage

Advanced usage, including non-standard UART modes and binary protocols, is in the roadmap for future development.