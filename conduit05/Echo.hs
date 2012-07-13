import Data.Conduit
import Data.Conduit.Network

app :: Application IO
app src sink = src $$ sink

main :: IO ()
main = runTCPServer (ServerSettings 4000 HostAny) app

