import Data.Conduit
import qualified Data.Conduit.List as CL
import Data.Conduit.Network
import Data.Conduit.Text
import Data.Text

app :: Application IO
app src sink
	= src
	$$ decode utf8
	=$ CL.map toUpper
	=$ encode utf8
	=$ sink

main :: IO ()
main = runTCPServer (ServerSettings 4000 HostAny) app

