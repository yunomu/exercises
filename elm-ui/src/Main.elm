module Main exposing (main)

import Element as Elm exposing (Element)
import Element.Background as Background
import Element.Border as Border
import Element.Font as Font


main =
    Elm.layout []
        myRowOfStuff


myRowOfStuff : Element msg
myRowOfStuff =
    Elm.row
        [ Elm.width Elm.fill
        , Elm.centerY
        , Elm.spacing 30
        ]
        [ myElement
        , myElement
        , Elm.el [ Elm.alignRight ] myElement
        , myElement
        ]


myElement : Element msg
myElement =
    Elm.el
        [ Background.color (Elm.rgb255 240 0 245)
        , Font.color (Elm.rgb255 255 255 255)
        , Border.rounded 10
        , Elm.padding 30
        ]
    <|
        Elm.text "stylish!!"
