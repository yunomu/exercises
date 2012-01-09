-module(logger).
-export([start/1]).
-compile(export_all).

start(Name) ->
	Pid = spawn(fun() -> loop() end),
	register(Name, Pid).

loop() ->
	receive
		Msg ->
			io:format("~s: ~s~n", [timestamp(), Msg]),
			loop()
	end.

timestamp() ->
	{Year, Month, Day} = date(),
	{Hour, Minute, Second} = time(),
	Str = io_lib:format("~p-~p-~p ~p:~p:~p",
		[Year, Month, Day, Hour, Minute, Second]),
	lists:flatten(Str).

