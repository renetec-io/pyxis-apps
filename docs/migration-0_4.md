# Migration to Pyxis SDK v.0.4

APIs for FIFO pipes, UART, and GPIO were changed to use the object-oriented style. 
The change is not backward compatible, and applications currently using any of them
may stop working. Please carefully check the recommendations below.

## FIFO pipes

`pyxis.fifo` methods has changed:

|Old|New|
|---|---|
|`openRead(name, callback)`|`readPipe = openReader(name, callback)`|
|`openWrite(name)`|`writePipe = openWriter(name)`|
|`write(name, data)`|`writePipe.write(data)`|
|`openEval(name)`|`evalPipe = openEval(name)`|
|`close(name)`|`pipe.close()`|

## UART

`pyxis.uart` methods has changed:

|Old|New|
|---|---|
|`open(baudrate, rxCallback, txCallback)`|`port = open(0, baudrate, {rxCallback, txCallback})`|
|`write(data)`|`port.write(data)`|
|`close()`|`port.close()`|

## GPIO

`pyxis.gpio` methods has changed:

|Old|New|
|---|---|
|`init(pin, mode, conf)`|`pin = open(pin, mode, conf)`|
|`read(pin)`|`pin.read()`|
|`write(pin, value)`|`pin.write(value)`|
|`onChange(pin, conf)`|`pin.onChange(conf)`|
|`deinit(pin)`|`pin.close()`|
