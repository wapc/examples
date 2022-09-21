package middleware

import (
	"context"
)

type RedirectImpl struct {
}

func NewRedirect() *RedirectImpl {
	return &RedirectImpl{}
}

func (r *RedirectImpl) Initialize(ctx context.Context, config *Config) error {
	return nil
}

func (r *RedirectImpl) Handle(ctx context.Context, request *HttpRequest) (*HttpResponse, error) {
	// Redirect
	if request.URI == "/" {
		return &HttpResponse{
			URI: "/hello",
		}, nil
	}

	// Return body
	return &HttpResponse{
		Request: Set{
			SetHeaders: Headers{
				"username": {"World"},
			},
		},
		Response: Set{
			SetHeaders: Headers{
				"Content-Type": {"text/plain"},
				"X-Middleware": {"Redirect"},
			},
		},
		Status: 200,
		Body:   []byte("Hello from WebAssembly!\n"),
	}, nil
}
