-module(httpd).
-export([start/0, start/1]).
%-compile(export_all).

-import(io_lib, [format/2]).

start() -> start(31011).

start(Port) ->
	{ok, Listen} = gen_tcp:listen(Port,
	               	[binary, {reuseaddr, true}, {active, true}]),
	counter:start(thread_counter),
	io:format("start httpd.~nport: ~p~n", [Port]),
	fork(Listen).

fork(Listen) ->
	thread_counter ! add,
	spawn(fun() -> loop(Listen) end).

loop(Listen) ->
	{ok, Socket} = gen_tcp:accept(Listen),
	fork(Listen),
	worker(Socket),
	thread_counter ! sub.

worker(Socket) ->
	request_parser:parse(receive_data(Socket)),
	responce_header(Socket, 200, ["Content-type: text/html"]),
	sock_write(Socket, "<h1>Index</h1>"),
	gen_tcp:close(Socket).

receive_data(Socket) ->
	receive
		{tcp, Socket, Bin} ->
			binary_to_list(Bin);
		{tcp_closed, Socket} ->
			io:fwrite("error\n")
	end.

sock_write(Socket, Str) ->
	gen_tcp:send(Socket, list_to_binary(Str)).

responce_header(Socket, Code, Header) ->
	sock_write(Socket, format("HTTP/1.0 ~p OK\r\n", [Code])),
	lists:map(fun(H) ->
			sock_write(Socket, format("~p\r\n", [H]))
		end, Header),
	sock_write(Socket, "\r\n").

