#!/usr/bin/ruby
# -*- coding: utf-8 -*-

require "rexml/document"
require "yaml"

config = YAML.load_file(ARGV[0].nil? ? "config.yml" : ARGV[0])

repository = config["repository"]

date = `date +"%Y-%m-%d %T %z" -d "a week ago"`.chomp

svn = `svn log --xml -v -r {\"#{date}\"}:HEAD #{repository}`

REXML::Document.new(svn).elements["/log"].elements.each {|elm|
    revision = elm.attribute("revision").value
    author = elm.elements["author"].text
    date = elm.elements["date"].text
    print date, $/
    elm.elements["paths"].elements.each {|path|
        next if path.attribute("kind").value == "dir"
        action = path.attribute("action").value
        print action, " ", path.text, $/
    }
}
