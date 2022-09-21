package greeter

import (
	"context"

	msgpack "github.com/wapc/tinygo-msgpack"
)

type Client interface {
	Invoke(ctx context.Context, operation string, payload []byte) ([]byte, error)
}

type greeterClient struct {
	client Client
}

func NewGreeterClient(client Client) Greeter {
	return &greeterClient{
		client: client,
	}
}

func (m *greeterClient) SayHello(ctx context.Context, firstName, lastName string) (string, error) {
	args := greeterSayHelloArgs{
		FirstName: firstName,
		LastName:  lastName,
	}
	payload, err := msgpack.ToBytes(&args)
	if err != nil {
		return "", err
	}

	result, err := m.client.Invoke(ctx, "greeting.v1.Greeter/sayHello", payload)
	if err != nil {
		return "", err
	}

	decoder := msgpack.NewDecoder(result)
	return decoder.ReadString()
}
