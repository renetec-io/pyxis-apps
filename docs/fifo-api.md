# FIFO pipe API
A first-in first-out (FIFO), or named pipe, is a special file accessed through the filesystem. It provides a unidirectional interprocess communication channel. The FIFO must be opened on both ends before any data can be passed.
Pipes open with Pyxis API are available for other processes at `/tmp/pyxis-fifo/<PIPE-NAME>` for writing to or reading from, similarly to a regular file.

## Reading from FIFO
Data can be retrieved from an external process over a FIFO, one line at a time.
To open a pipe for reading, call
```
fifo.openRead(name, callback);
```
- `name: string`, the name of the pipe, must qualify for a valid file name
- `callback: function` - a callback function to be called every time the new line of data is available. The function will be given a single argument: retrieved data.

## Writing to FIFO
Data can be provided to an external process over a FIFO, one line at a time.
To open a pipe for writing, call
```
fifo.openWrite(name);
```
- `name: string`, the name of the pipe, must qualify for a valid file name.

To write to a pipe, call
```
fifo.write(name, data);
```
- `name: string` - the name of the pipe, must be previously open with `openWrite`
- `data: string` - data to be written
Multiple calls with the same pipe name will be stacked and serviced in the same order.

## Evaluating from FIFO
A FIFO can be used for evaluation (execution) of JavaScript code from an external process in the scripting context of the HTML frame form which FIFO was open.
To open a FIFO pipe for evaluation, call
```
fifo.openEval(name);
```
- `name: string` - the name of the pipe, must qualify for a valid file name

## Closing FIFO
A FIFO may stay open when it is waiting for the other side to read or write data. It is automatically closed when the HTML frame is unloaded, including during page reload.
To close a FIFO manually and abort all read/write operations on the pipe, call:
```
fifo.close(name);
```
- `name: string` - the name of the pipe previously open with `openRead`, `openWrite`, or `openEval`
