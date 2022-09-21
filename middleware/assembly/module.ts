import { Decoder, Writer, Encoder, Sizer, Codec } from "@wapc/as-msgpack";

export type Headers = Map<string, Array<string>>;

import { register, Result } from "@wapc/as-guest";
export { Result } from "@wapc/as-guest";
export class Handlers {
  static registerInitialize(handler: (config: Config) => Error | null): void {
    initializeHandler = handler;
    register("http.middleware.v1.Redirect/initialize", initializeWrapper);
  }

  static registerHandle(
    handler: (request: HttpRequest) => Result<HttpResponse>
  ): void {
    handleHandler = handler;
    register("http.middleware.v1.Redirect/handle", handleWrapper);
  }
}

var initializeHandler: (config: Config) => Error | null;
function initializeWrapper(payload: ArrayBuffer): Result<ArrayBuffer> {
  const decoder = new Decoder(payload);
  const request = new Config();
  request.decode(decoder);
  initializeHandler(request);
  return Result.ok(new ArrayBuffer(0));
}

var handleHandler: (request: HttpRequest) => Result<HttpResponse>;
function handleWrapper(payload: ArrayBuffer): Result<ArrayBuffer> {
  const decoder = new Decoder(payload);
  const request = new HttpRequest();
  request.decode(decoder);
  const result = handleHandler(request);
  const response = result.get();
  return Result.ok(response.toBuffer());
}

export class Config implements Codec {
  static decodeNullable(decoder: Decoder): Config | null {
    if (decoder.isNextNil()) return null;
    return Config.decode(decoder);
  }

  // decode
  static decode(decoder: Decoder): Config {
    const o = new Config();
    o.decode(decoder);
    return o;
  }

  decode(decoder: Decoder): void {
    var numFields = decoder.readMapSize();

    while (numFields > 0) {
      numFields--;
      const field = decoder.readString();
    }
  }

  encode(encoder: Writer): void {
    encoder.writeMapSize(0);
  }

  toBuffer(): ArrayBuffer {
    let sizer = new Sizer();
    this.encode(sizer);
    let buffer = new ArrayBuffer(sizer.length);
    let encoder = new Encoder(buffer);
    this.encode(encoder);
    return buffer;
  }

  static newBuilder(): ConfigBuilder {
    return new ConfigBuilder();
  }
}

export class ConfigBuilder {
  instance: Config = new Config();

  build(): Config {
    return this.instance;
  }
}

export class HttpRequest implements Codec {
  method: string = "";
  uri: string = "";
  headers: Headers = new Map<string, Array<string>>();
  body: ArrayBuffer | null = null;

  static decodeNullable(decoder: Decoder): HttpRequest | null {
    if (decoder.isNextNil()) return null;
    return HttpRequest.decode(decoder);
  }

  // decode
  static decode(decoder: Decoder): HttpRequest {
    const o = new HttpRequest();
    o.decode(decoder);
    return o;
  }

  decode(decoder: Decoder): void {
    var numFields = decoder.readMapSize();

    while (numFields > 0) {
      numFields--;
      const field = decoder.readString();

      if (field == "method") {
        this.method = decoder.readString();
      } else if (field == "uri") {
        this.uri = decoder.readString();
      } else if (field == "headers") {
        this.headers = decoder.readMap(
          (decoder: Decoder): string => {
            return decoder.readString();
          },
          (decoder: Decoder): Array<string> => {
            return decoder.readArray((decoder: Decoder): string => {
              return decoder.readString();
            });
          }
        );
      } else if (field == "body") {
        if (decoder.isNextNil()) {
          this.body = null;
        } else {
          this.body = decoder.readByteArray();
        }
      } else {
        decoder.skip();
      }
    }
  }

  encode(encoder: Writer): void {
    encoder.writeMapSize(4);
    encoder.writeString("method");
    encoder.writeString(this.method);
    encoder.writeString("uri");
    encoder.writeString(this.uri);
    encoder.writeString("headers");
    encoder.writeMap(
      this.headers,
      (encoder: Writer, key: string): void => {
        encoder.writeString(key);
      },
      (encoder: Writer, value: Array<string>): void => {
        encoder.writeArray(value, (encoder: Writer, item: string): void => {
          encoder.writeString(item);
        });
      }
    );
    encoder.writeString("body");
    if (this.body === null) {
      encoder.writeNil();
    } else {
      encoder.writeByteArray(this.body!);
    }
  }

  toBuffer(): ArrayBuffer {
    let sizer = new Sizer();
    this.encode(sizer);
    let buffer = new ArrayBuffer(sizer.length);
    let encoder = new Encoder(buffer);
    this.encode(encoder);
    return buffer;
  }

  static newBuilder(): HttpRequestBuilder {
    return new HttpRequestBuilder();
  }
}

export class HttpRequestBuilder {
  instance: HttpRequest = new HttpRequest();

  withMethod(method: string): HttpRequestBuilder {
    this.instance.method = method;
    return this;
  }

  withUri(uri: string): HttpRequestBuilder {
    this.instance.uri = uri;
    return this;
  }

  withHeaders(headers: Headers): HttpRequestBuilder {
    this.instance.headers = headers;
    return this;
  }

  withBody(body: ArrayBuffer | null): HttpRequestBuilder {
    this.instance.body = body;
    return this;
  }

  build(): HttpRequest {
    return this.instance;
  }
}

export class HttpResponse implements Codec {
  uri: string = "";
  request: Set = new Set();
  response: Set = new Set();
  status: u16 = 0;
  body: ArrayBuffer | null = null;

  static decodeNullable(decoder: Decoder): HttpResponse | null {
    if (decoder.isNextNil()) return null;
    return HttpResponse.decode(decoder);
  }

  // decode
  static decode(decoder: Decoder): HttpResponse {
    const o = new HttpResponse();
    o.decode(decoder);
    return o;
  }

  decode(decoder: Decoder): void {
    var numFields = decoder.readMapSize();

    while (numFields > 0) {
      numFields--;
      const field = decoder.readString();

      if (field == "uri") {
        this.uri = decoder.readString();
      } else if (field == "request") {
        this.request = Set.decode(decoder);
      } else if (field == "response") {
        this.response = Set.decode(decoder);
      } else if (field == "status") {
        this.status = decoder.readUInt16();
      } else if (field == "body") {
        if (decoder.isNextNil()) {
          this.body = null;
        } else {
          this.body = decoder.readByteArray();
        }
      } else {
        decoder.skip();
      }
    }
  }

  encode(encoder: Writer): void {
    encoder.writeMapSize(5);
    encoder.writeString("uri");
    encoder.writeString(this.uri);
    encoder.writeString("request");
    this.request.encode(encoder);
    encoder.writeString("response");
    this.response.encode(encoder);
    encoder.writeString("status");
    encoder.writeUInt16(this.status);
    encoder.writeString("body");
    if (this.body === null) {
      encoder.writeNil();
    } else {
      encoder.writeByteArray(this.body!);
    }
  }

  toBuffer(): ArrayBuffer {
    let sizer = new Sizer();
    this.encode(sizer);
    let buffer = new ArrayBuffer(sizer.length);
    let encoder = new Encoder(buffer);
    this.encode(encoder);
    return buffer;
  }

  static newBuilder(): HttpResponseBuilder {
    return new HttpResponseBuilder();
  }
}

export class HttpResponseBuilder {
  instance: HttpResponse = new HttpResponse();

  withUri(uri: string): HttpResponseBuilder {
    this.instance.uri = uri;
    return this;
  }

  withRequest(request: Set): HttpResponseBuilder {
    this.instance.request = request;
    return this;
  }

  withResponse(response: Set): HttpResponseBuilder {
    this.instance.response = response;
    return this;
  }

  withStatus(status: u16): HttpResponseBuilder {
    this.instance.status = status;
    return this;
  }

  withBody(body: ArrayBuffer | null): HttpResponseBuilder {
    this.instance.body = body;
    return this;
  }

  build(): HttpResponse {
    return this.instance;
  }
}

export class Set implements Codec {
  setHeaders: Headers = new Map<string, Array<string>>();
  removeHeaders: Array<string> = new Array<string>();

  static decodeNullable(decoder: Decoder): Set | null {
    if (decoder.isNextNil()) return null;
    return Set.decode(decoder);
  }

  // decode
  static decode(decoder: Decoder): Set {
    const o = new Set();
    o.decode(decoder);
    return o;
  }

  decode(decoder: Decoder): void {
    var numFields = decoder.readMapSize();

    while (numFields > 0) {
      numFields--;
      const field = decoder.readString();

      if (field == "setHeaders") {
        this.setHeaders = decoder.readMap(
          (decoder: Decoder): string => {
            return decoder.readString();
          },
          (decoder: Decoder): Array<string> => {
            return decoder.readArray((decoder: Decoder): string => {
              return decoder.readString();
            });
          }
        );
      } else if (field == "removeHeaders") {
        this.removeHeaders = decoder.readArray((decoder: Decoder): string => {
          return decoder.readString();
        });
      } else {
        decoder.skip();
      }
    }
  }

  encode(encoder: Writer): void {
    encoder.writeMapSize(2);
    encoder.writeString("setHeaders");
    encoder.writeMap(
      this.setHeaders,
      (encoder: Writer, key: string): void => {
        encoder.writeString(key);
      },
      (encoder: Writer, value: Array<string>): void => {
        encoder.writeArray(value, (encoder: Writer, item: string): void => {
          encoder.writeString(item);
        });
      }
    );
    encoder.writeString("removeHeaders");
    encoder.writeArray(
      this.removeHeaders,
      (encoder: Writer, item: string): void => {
        encoder.writeString(item);
      }
    );
  }

  toBuffer(): ArrayBuffer {
    let sizer = new Sizer();
    this.encode(sizer);
    let buffer = new ArrayBuffer(sizer.length);
    let encoder = new Encoder(buffer);
    this.encode(encoder);
    return buffer;
  }

  static newBuilder(): SetBuilder {
    return new SetBuilder();
  }
}

export class SetBuilder {
  instance: Set = new Set();

  withSetHeaders(setHeaders: Headers): SetBuilder {
    this.instance.setHeaders = setHeaders;
    return this;
  }

  withRemoveHeaders(removeHeaders: Array<string>): SetBuilder {
    this.instance.removeHeaders = removeHeaders;
    return this;
  }

  build(): Set {
    return this.instance;
  }
}
