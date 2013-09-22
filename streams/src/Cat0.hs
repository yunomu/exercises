import System.IO

main :: IO ()
main = hGetChar stdin >>= hPutChar stdout >> main
