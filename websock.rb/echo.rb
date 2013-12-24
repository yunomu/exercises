#!/usr/bin/ruby

require 'rubygems'
require 'websocket-client-simple'

ws = WebSocket::Client::Simple.connect 'http://echo.websocket.org'

ws.on :message do |msg|
    puts msg.data
end

loop do
    ws.send STDIN.gets.strip
end
