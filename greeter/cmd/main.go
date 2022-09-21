package main

import (
	"github.com/wapc/examples/greeter/pkg/greeter"
)

func main() {
	// Create services
	greeterService := greeter.NewGreeter()

	// Register services
	greeter.RegisterGreeter(greeterService)
}
