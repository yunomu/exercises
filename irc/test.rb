#!/usr/bin/env ruby
# -*- encoding: utf-8 -*-

require 'cinch'
require 'yaml'

bot = Cinch::Bot.new do
    configure do |c|
        conf = YAML.load_file("config.yml")
        c.server = conf["server"]
        c.port = conf["port"] if !conf["port"].nil?
        c.channels = conf["channels"]
        c.nick = conf["nick"]
        c.realname = conf["realname"]
        c.password = conf["password"] if !conf["password"].nil?
    end

    on :message, "きゅんきゅん" do |m|
        m.reply "ﾊｲﾊｲ!!"
    end
end

bot.start
