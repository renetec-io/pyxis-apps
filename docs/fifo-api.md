# FIFO pipe API

The API allows creation and access to FIFO pipes at a predefined location.

A first-in first-out (FIFO), or named pipe, is a special file accessed through the filesystem. It provides a unidirectional inter-process communication channel. The FIFO must be opened on both ends before any data can be passed.
Pipes open with Pyxis API are available for other processes at `/tmp/pyxis-fifo/<PIPE-NAME>` for writing to or reading from, similarly to regular files. Pipe names must qualify for file names in Linux.

----
- API methods
    - [`openReader()`](#openreadername-callback)
    - [`FifoReader.close()`](#fiforeaderclose)
    - [`openWriter()`](#openwritername)
    - [`FifoWriter.write()`](#fifowriterwritedata)
    - [`FifoWriter.close()`](#fifowriterclose)
    - [`openEval()`](#openevalname)
    - [`FifoEval.close()`](#fifoevalclose)
----

### `openReader(name, callback)`
Creates a pipe with the name `name` intended for reading and returns an instance of the FifoReader class. A `callback` function is called every time a new line of data is available from the pipe. The functions receives the retrieved data as an argument.

### `FifoReader.close()`
Closes the pipe previously open with `openReader()`. 

### `openWriter(name)`
Creates a pipe with the name `name` intended for writing and returns an instance of the FifoWriter class.

### `FifoWriter.write(data)`
Writes a line of text into the pipe. Multiple calls are queued and serviced in the same order.

### `FifoWriter.close()`
Closes the pipe previously open with `openWriter()`. 

### `openEval(name)`
Creates a special kind pipe for JavaScript code execution. Everything written to the pipe by external process is interpreted as executable instructions and evaluated in the context of the page from which the method is called. The method returns an instance of the FifoEval class. `name` is the pipe name.

### `FifoEval.close()`
Closes the pipe previously open with `openEval()`. 