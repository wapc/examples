package bench

import (
	"context"
	"os"
	"testing"

	"github.com/wapc/wapc-go"
	"github.com/wapc/wapc-go/engines/wazero"

	"github.com/wapc/examples/greeter/pkg/greeter"
)

// Prevent compiler optimization
var greetingMessage string

func BenchmarkInvoke(b *testing.B) {
	ctx := context.Background()
	code, err := os.ReadFile("build/greeter.wasm")
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

	inst, err := module.Instantiate(ctx)
	if err != nil {
		panic(err)
	}
	defer inst.Close(ctx)

	g := greeter.NewGreeterClient(inst)
	g.SayHello(ctx, "John", "Doe")

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		greetingMessage, err = g.SayHello(ctx, "John", "Doe")
		if err != nil {
			b.Log(err)
			b.FailNow()
		}
	}
	b.StopTimer()
}

func SayHello(ctx context.Context, firstName, lastName string) (string, error) {
	return "Hello, " + firstName + " " + lastName, nil
}

// Baseline
// BenchmarkInvoke-10    38391553     30.18 ns/op      16 B/op       1 allocs/op

// waPC wazero
// BenchmarkInvoke-10      295081      3606 ns/op     656 B/op      21 allocs/op

// waPC wasmtime
// BenchmarkInvoke-10      206461      4978 ns/op     831 B/op      46 allocs/op
