-module(request_parser).
-export([parse/1]).
%-compile(export_all).

parse(Str) ->
	io:format(Str),
	{request}.

