package greeter

import (
	"context"
)

type GreeterImpl struct {
}

func NewGreeter() *GreeterImpl {
	return &GreeterImpl{}
}

func (g *GreeterImpl) SayHello(ctx context.Context, firstName string, lastName string) (string, error) {
	return "Hello, " + firstName + " " + lastName, nil
}
