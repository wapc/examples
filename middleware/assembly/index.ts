import {
  Config,
  HttpRequest,
  HttpResponse,
  Set,
  Handlers,
  Result,
  HttpResponseBuilder,
} from "./module";

export function wapc_init(): void {
  Handlers.registerInitialize(initialize);
  Handlers.registerHandle(handle);
}

function initialize(config: Config): Error | null {
  return null;
}

function handle(request: HttpRequest): Result<HttpResponse> {
  // Redirect
  if (request.uri == "/") {
    return Result.ok(
      new HttpResponseBuilder().
        withUri("/hello").
        build());
  }

  const req = new Set();
  const reqHeaders = new Map<string, string[]>();
  reqHeaders.set("username", ["World"]);
  req.setHeaders = reqHeaders;

  const res = new Set();
  const resHeaders = new Map<string, string[]>();
  resHeaders.set("Content-Type", ["text/plain"]);
  resHeaders.set("X-Middleware", ["Redirect"]);
  res.setHeaders = resHeaders;

  // Return body
  return Result.ok(
    new HttpResponseBuilder().
      withRequest(req).
      withResponse(res).
      withStatus(200).
      withBody(String.UTF8.encode("Hello from WebAssembly!\n")).
      build());
}

// Boilerplate code for waPC.  Do not remove.

import { handleCall, handleAbort } from "@wapc/as-guest";

export function __guest_call(operation_size: usize, payload_size: usize): bool {
  return handleCall(operation_size, payload_size);
}

// Abort function
function abort(
  message: string | null,
  fileName: string | null,
  lineNumber: u32,
  columnNumber: u32
): void {
  handleAbort(message, fileName, lineNumber, columnNumber);
}
