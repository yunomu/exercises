{-# LANGUAGE ViewPatterns #-}

view :: Int -> Either String Int
view 0 = Left "Zero"
view i = Right i

test :: Int -> String
test (view -> Left s)  = s
test (view -> Right n) = show n
test _ = error "not reached"
--test i = case view i of
--    Left s -> s
--    Right n -> show n
