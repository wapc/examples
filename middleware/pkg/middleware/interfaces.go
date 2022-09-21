// Code generated by @apexlang/codegen. DO NOT EDIT.

package middleware

import (
	"context"
)

type ns struct{}

func (n *ns) Namespace() string {
	return "http.middleware.v1"
}

type Headers map[string][]string

type Redirect interface {
	Initialize(ctx context.Context, config *Config) error
	Handle(ctx context.Context, request *HttpRequest) (*HttpResponse, error)
}

type Config struct {
	ns
}

func (c *Config) Type() string {
	return "Config"
}

type HttpRequest struct {
	ns
	Method  string  `json:"method" yaml:"method" msgpack:"method"`
	URI     string  `json:"uri" yaml:"uri" msgpack:"uri"`
	Headers Headers `json:"headers" yaml:"headers" msgpack:"headers"`
	Body    []byte  `json:"body,omitempty" yaml:"body,omitempty" msgpack:"body,omitempty"`
}

func (h *HttpRequest) Type() string {
	return "HttpRequest"
}

type HttpResponse struct {
	ns
	URI      string `json:"uri" yaml:"uri" msgpack:"uri"`
	Request  Set    `json:"request" yaml:"request" msgpack:"request"`
	Response Set    `json:"response" yaml:"response" msgpack:"response"`
	Status   uint16 `json:"status" yaml:"status" msgpack:"status"`
	Body     []byte `json:"body,omitempty" yaml:"body,omitempty" msgpack:"body,omitempty"`
}

func (h *HttpResponse) Type() string {
	return "HttpResponse"
}

type Set struct {
	ns
	SetHeaders    Headers  `json:"setHeaders" yaml:"setHeaders" msgpack:"setHeaders"`
	RemoveHeaders []string `json:"removeHeaders" yaml:"removeHeaders" msgpack:"removeHeaders"`
}

func (s *Set) Type() string {
	return "Set"
}