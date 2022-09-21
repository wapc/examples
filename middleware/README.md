# HTTP Middleware

Making custom WebAssembly [ABI](https://en.wikipedia.org/wiki/Application_binary_interface)s requires rigor, discipline, and significant time. The complexity of testing, versioning, backward compatibility, data serialization, threading, multi-language support, and ongoing maintenance is easy to  underestimate.

This example shows how products and platforms can use [waPC](https://wapc.io) and [Apex](https://apexlang.io) to create plugin systems for WebAssembly-based HTTP middleware. We use Apex to define interfaces and generate language-specific code for both the middleware component and host process.

### Installation

Requirements:
* [Go 1.19+](https://go.dev/dl/) - The Go programming language
* [TinyGo 0.25+](https://tinygo.org/getting-started/install/) - Compiles Go programs to WebAssembly and microcontrollers 
* [Apex CLI](https://apexlang.io/docs/getting-started) - An interface description language for modeling *any* software
* The waPC code generation module

To install the waPC code generation module:

```shell
apex install @wapc/codegen
```

### Building

Use this command to run the code generator from the command line:

```shell
apex generate
```

If you open this project in VS Code, there should be a task to run in the background and watch `middleware.apexlang` for changes and rerun the code generators.

The only file you need to edit is `pkg/middleware.go`.

Compile the TinyGo version of the module:

```shell
make
```

Compile the AssemblyScript version of the module:

```shell
npm install
npm run build
```

### Running

Now you can run a simple [fasthttp](https://github.com/valyala/fasthttp) / [fasthttprouter](https://github.com/buaazp/fasthttprouter) example that loads the WebAssembly middleware component located at `build/middleware.wasm`. Optionally, you can edit `main.go` to point to the AssemblyScript file at `build/middleware-as.wasm`.

```
go run main.go
```

From another terminal, test the component with cURL.

```shell
curl -i -L http://localhost:8181
```

```
HTTP/1.1 301 Moved Permanently
Server: fasthttp
Date: Wed, 21 Sep 2022 20:11:48 GMT
Content-Length: 0
Location: http://localhost:8181/hello/

HTTP/1.1 200 OK
Server: fasthttp
Date: Wed, 21 Sep 2022 20:11:48 GMT
Content-Type: text/plain
Content-Length: 23

Hello from WebAssembly!
```
