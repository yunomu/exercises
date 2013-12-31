#!/usr/bin/ruby

require 'websocket-client-simple'
require 'json'
require 'open-uri'
require 'frappuccino'

def pagelist(host = "localhost", port = 9222)
  JSON.parse open("http://#{host}:#{port}/json") {|f|
    f.read
  }
end

w = pagelist.find {|e| e["title"].include? "frames" }
puts w

MAX = 2**64

debugUrl = w["webSocketDebuggerUrl"] || begin
  puts "debugUrl is nil"
  exit 1
end

def evaluate(expr)
  {
    "id" => Random.rand(MAX),
    "method" => "Runtime.evaluate",
    "params" => {
      "expression" => expr,
      "returnByValue" => true
    }
  }
end

ws = WebSocket::Client::Simple.connect debugUrl

class Emitter
  def send(data)
    emit(data)
  end
end
emitter = Emitter.new
stream = Frappuccino::Stream.new(emitter)

# debug
#stream.on_value do |v|
#  puts v
#end

stream
  .select {|d| d["method"] == "Timeline.eventRecorded"}
  .map {|d| puts d }

stream
  .select {|d| d["method"] != "Timeline.eventRecorded"}
  .map {|d| open("log", "a+") {|f| f.puts d } }

ws.on :message do |msg|
  data = JSON.parse(msg.data)
  emitter.send(data)
end

ws.on :open do
  puts "open"
  ws.send JSON.dump("id" => 1, "method" => "Timeline.start")
end

ws.on :close do |s|
  puts "close"
end

sleep 5
ws.close
