#!/usr/bin/ruby

require 'rubygems'
require 'websocket-client-simple'
require 'json'
require 'open-uri'

def pagelist(host = "localhost", port = 9222)
    JSON.parse open("http://#{host}:#{port}/json") {|f|
        f.read
    }
end

w = pagelist.find {|e| e["title"].include? "GitHub" }
print w, $/

MAX = 2**64

debugUrl = w["webSocketDebuggerUrl"] || begin
    print "debugUrl is nil", $/
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

def timeline(op)
    {
        "id" => Random.rand(MAX),
        "method" => "Timeline.#{op}"
    }
end

ws = WebSocket::Client::Simple.connect debugUrl

ws.on :message do |msg|
    data = JSON.parse(msg.data)
    next if data["method"] != "Timeline.eventRecorded"
    print "response: ", data["params"], $/
end

ws.on :open do
    dat = JSON.dump timeline("start")
    ws.send dat
end

ws.on :close do |s|
    print "close", $/
end

sleep 5
ws.send JSON.dump(timeline("stop"))
sleep 1
ws.close
