data Shape = Rectangle Float Float
           | Square Float

area :: Shape -> Float
area (Rectangle l w) = l * w
area (Square s)      = s * s
