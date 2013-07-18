#!/usr/bin/env ruby
# -*- encoding: utf-8 -*-

require 'cinch'
require 'yaml'

file = ARGV[1].nil? ? "config.yml" : ARGV[1]

bot = Cinch::Bot.new do
    configure do |c|
        conf = YAML.load_file(file)
        c.server = conf["server"]
        c.port = conf["port"] if !conf["port"].nil?
        c.channels = conf["channels"]
        c.nick = conf["nick"]
        c.realname = conf["realname"]
        c.password = conf["password"] if !conf["password"].nil?
    end

    on :message, "かしこいかわいい" do |m|
        m.reply "エリーチカ！"
    end
end

bot.start
