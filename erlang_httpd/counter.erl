-module(counter).
-export([start/1, add/1, sub/1, get/1, stop/1]).
%-compile(export_all).

start(Name) ->
	Pid = spawn(fun() -> loop(0) end),
	register(Name, Pid),
	Name.

loop(Count) ->
	receive
		add ->
			loop(Count + 1);
		sub ->
			loop(Count - 1);
		{From, get} ->
			From ! Count,
			loop(Count);
		stop ->
			stop;
		Any ->
			io:format("Undefined message: ~p~n", [Any]),
			loop(Count)
	end.

call(To, Msg) ->
	To ! {self(), Msg},
	receive
		Response -> Response
	end.

add(To) -> To ! add.
sub(To) -> To ! add.
get(To) -> call(To, get).
stop(To) -> To ! stop.

