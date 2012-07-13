import Data.ByteString
import qualified Data.ByteString.Char8 as S8
import Data.Conduit
import qualified Data.Conduit.Binary as CB
import Data.Conduit.Network

app :: Application (ResourceT IO)
app src sink = src $$ conduit =$ sink

conduit :: Conduit ByteString (ResourceT IO) ByteString
conduit = CB.lines =$=
    awaitForever (CB.sourceFile . S8.unpack . S8.takeWhile (/= '\r'))

main :: IO ()
main = runResourceT $ runTCPServer (ServerSettings 4000 HostAny) app

