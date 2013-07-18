#!/usr/bin/env ruby
# -*- encoding: utf-8 -*-

require 'cinch'
require 'yaml'

class Nico
    include Cinch::Plugin

    def initialize(bot)
        super(bot)
        @count = 1
    end

    timer 1, method: :niconico
    def niconico
        Channel("#test").msg("にっこ" * @count + "にー")
        @count = @count == 10 ? 1 : @count + 1
    end
end

bot = Cinch::Bot.new do
    configure do |c|
        conf = YAML.load_file("config.yml")
        c.server = conf["server"]
        c.port = conf["port"] if !conf["port"].nil?
        c.channels = conf["channels"]
        c.nick = conf["nick"]
        c.realname = conf["realname"]
        c.password = conf["password"] if !conf["password"].nil?
        c.plugins.plugins = [Nico]
    end
end

bot.start
