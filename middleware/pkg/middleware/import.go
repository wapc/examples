package middleware

import (
	"context"

	msgpack "github.com/wapc/tinygo-msgpack"
)

type Client interface {
	Invoke(ctx context.Context, operation string, payload []byte) ([]byte, error)
}

type redirectClient struct {
	client Client
}

func NewRedirectClient(client Client) Redirect {
	return &redirectClient{
		client: client,
	}
}

func (m *redirectClient) Initialize(ctx context.Context, config *Config) error {
	payload, err := msgpack.ToBytes(config)
	if err != nil {
		return err
	}
	_, err = m.client.Invoke(ctx, "http.middleware.v1.Redirect/initialize", payload)
	return err
}

func (m *redirectClient) Handle(ctx context.Context, request *HttpRequest) (*HttpResponse, error) {
	payload, err := msgpack.ToBytes(request)
	if err != nil {
		return nil, err
	}

	result, err := m.client.Invoke(ctx, "http.middleware.v1.Redirect/handle", payload)
	if err != nil {
		return nil, err
	}

	var response HttpResponse
	decoder := msgpack.NewDecoder(result)
	if err = response.Decode(&decoder); err != nil {
		return nil, err
	}

	return &response, nil
}
