import System.Directory
import System.FilePath

main :: IO ()
main = do
    getCurrentDirectory >>= print . splitFileName
    print $ splitFileName "test/"
    print $ dropFileName "test/abc/d"

