import Data.ByteString
import qualified Data.ByteString.Char8 as S8
import Data.Conduit
import qualified Data.Conduit.List as CL
import Data.Conduit.Network
import Data.Conduit.Text
import Data.Text

app :: Application IO
app src sink = src
	$$ conduit
	=$ sink

conduit :: Conduit ByteString IO ByteString
conduit = CL.map (\bs -> S8.pack $ show (S8.length bs) ++ "\n")

main :: IO ()
main = runTCPServer (ServerSettings 4000 HostAny) app

