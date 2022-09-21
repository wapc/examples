package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/buaazp/fasthttprouter"
	"github.com/valyala/fasthttp"
	"github.com/wapc/wapc-go"
	"github.com/wapc/wapc-go/engines/wazero"

	"github.com/wapc/examples/middleware/pkg/middleware"
)

func main() {
	ctx := context.Background()

	// Load waPC module
	code, err := os.ReadFile("build/middleware.wasm")
	if err != nil {
		panic(err)
	}

	engine := wazero.Engine()
	module, err := engine.New(ctx, wapc.NoOpHostCallHandler, code, &wapc.ModuleConfig{
		Logger: wapc.PrintlnLogger,
		Stdout: os.Stdout,
		Stderr: os.Stderr,
	})
	if err != nil {
		panic(err)
	}
	defer module.Close(ctx)

	pool, err := wapc.NewPool(ctx, module, 10, func(instance wapc.Instance) error {
		redirect := middleware.NewRedirectClient(instance)
		return redirect.Initialize(ctx, &middleware.Config{})
	})
	if err != nil {
		panic(err)
	}
	defer pool.Close(ctx)

	// Create client
	client := wapcClient{pool: pool}
	redirect := middleware.NewRedirectClient(&client)

	// Initialize FastHTTP + middleware
	router := fasthttprouter.New()
	router.GET("/", Index)
	router.GET("/hello/", Hello)

	if err := fasthttp.ListenAndServe(":8181", requestHandler(redirect, router.Handler)); err != nil {
		log.Fatalf("Error in ListenAndServe: %s", err)
	}
}

// FastHTTP handlers

func Index(ctx *fasthttp.RequestCtx) {
	fmt.Fprint(ctx, "Index\n")
}

func Hello(ctx *fasthttp.RequestCtx) {
	username := ctx.Request.Header.Peek("username")
	fmt.Fprintf(ctx, "Hello, %s!\n", string(username))
}

// waPC pool client
// (This really could be added to waPC itself)

var ErrWasmPoolBusy = errors.New("wasm pool busy")

type wapcClient struct {
	pool *wapc.Pool
}

func (c *wapcClient) Invoke(ctx context.Context, operation string, payload []byte) ([]byte, error) {
	instance, err := c.pool.Get(1 * time.Second)
	if err != nil {
		return nil, ErrWasmPoolBusy
	}
	defer c.pool.Return(instance)

	return instance.Invoke(ctx, operation, payload)
}

// Middleware function

func requestHandler(m middleware.Redirect, h fasthttp.RequestHandler) fasthttp.RequestHandler {
	return func(ctx *fasthttp.RequestCtx) {
		// Create middleware HTTP Request.
		headers := make(map[string][]string)
		ctx.Request.Header.VisitAll(func(key, value []byte) {
			existing := headers[string(key)]
			existing = append(existing, string(value))
			headers[string(key)] = existing
		})
		response, err := m.Handle(ctx, &middleware.HttpRequest{
			Method:  string(ctx.Request.Header.Method()),
			URI:     string(ctx.Request.RequestURI()),
			Headers: headers,
		})
		if err != nil {
			status := fasthttp.StatusInternalServerError
			if err == ErrWasmPoolBusy {
				status = fasthttp.StatusTooManyRequests
			}
			ctx.Error(err.Error(), status)
			return
		}

		// Manipulate the FastHTTP request.
		for key, values := range response.Request.SetHeaders {
			for _, v := range values {
				ctx.Request.Header.Add(key, v)
			}
		}
		for _, key := range response.Request.RemoveHeaders {
			ctx.Request.Header.Del(key)
		}

		// Manipulate the FastHTTP response.
		for key, values := range response.Response.SetHeaders {
			for _, v := range values {
				ctx.Response.Header.Add(key, v)
			}
		}
		for _, key := range response.Response.RemoveHeaders {
			ctx.Response.Header.Del(key)
		}

		// Return a status and payload if set.
		if response.Status != 0 {
			ctx.Response.SetStatusCode(int(response.Status))
			ctx.Write(response.Body)
			return
		}

		// Handle redirect.
		if len(response.URI) > 0 {
			ctx.Request.SetRequestURIBytes([]byte(response.URI))
		}

		// Forward to request handler.
		h(ctx)
	}
}
