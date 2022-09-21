package main

import (
	"github.com/wapc/examples/middleware/pkg/middleware"
)

func main() {
	// Create services
	redirectService := middleware.NewRedirect()

	// Register services
	middleware.RegisterRedirect(redirectService)
}
