-module(httpd).
-export([start/0]).
%-compile(export_all).

start() -> start(31011).

start(Port) ->
	{ok, Listen} = gen_tcp:listen(Port,
						[binary, {reuseaddr, true}, {active, true}]),
	io:format("start httpd.~nport: ~p~n", [Port]),
	spawn(fun() -> loop(Listen) end).

loop(Listen) ->
	{ok, Socket} = gen_tcp:accept(Listen),
	spawn(fun() -> loop(Listen) end),
	receive
		{tcp, Socket, Bin} ->
			Str = binary_to_list(Bin),
			io:format(Str),
			sock_write(Socket, "HTTP/1.0 200 OK\r\n"),
			sock_write(Socket, "Content-type: text/html\r\n\r\n"),
			sock_write(Socket, "<h1>Index</h1>"),
			gen_tcp:close(Socket),
			loop(Listen);
		{tcp_closed, Socket} ->
			io:format("Server socket closed~n"),
			loop(Listen);
		Any ->
			io:format("Received: ~p~n", [Any]),
			loop(Listen)
	end.

sock_write(Socket, Str) ->
	gen_tcp:send(Socket, list_to_binary(Str)).

