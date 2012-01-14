

strlen :: IO ()
strlen = do putStr "Enter a string: "
            xs <- getLine
            putStr "The string has "
            putStr (show (length xs))
            putStrLn " characters"

beep :: IO ()
beep = putStr "\BEL"

cls :: IO ()
cls = putStr "\ESC[2J"

type Pos = (Int,Int)

goto :: Pos -> IO ()
goto (x,y) = putStr ("\ESC[" ++ show y ++ ";" ++ show x ++ "H")

writeat :: Pos -> String -> IO ()
writeat p xs = do goto p
                  putStr xs

seqn :: [IO a] -> IO ()
seqn []     = return ()
seqn (a:as) = do a
                 seqn as


box :: [String]
box = ["+-------+",
       "|       |",
       "+-+-+-+-+",
       "|q|c|d|=|",
       "+-+-+-+-+",
       "|1|2|3|+|",
       "+-+-+-+-+",
       "|4|5|6|-|",
       "+-+-+-+-+",
       "|7|8|9|*|",
       "+-+-+-+-+",
       "|0|(|)|/|",
       "+-+-+-+-+"]

buttons :: [Char]
buttons = standard ++ extra
          where
           standard = "qcd=123+456-789*0()/"
           extra    = "QCD \ESC\BS\DEL\n"

showbox :: IO ()
showbox = seqn [writeat (1,y) xs | (y,xs) <- zip [1..13] box]

display :: String -> IO ()
display xs = do writeat (3,2) (reverse (take 13 (reverse xs)))

calc :: String -> IO ()
calc xs = do display xs
             c <- getCh
             if elem c buttons then process c xs
                else do beep
                        calc xs

process :: Char -> String -> IO ()
process c xs
    | elem c "qQ\ESC"    = quit
    | elem c "dD\BS\DEL" = delete xs
    | elem c "=\n"       = eval xs
    | elem c "cC"        = clear
    | otherwise          = press c xs

