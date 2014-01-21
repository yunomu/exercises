puts Signal::list

trap(:INT) {
  puts "interrupted"
  exit
}

def ignore
  puts "ignore SIGTERM"
end

trap(:TERM, "ignore")

sleep 60 while true
