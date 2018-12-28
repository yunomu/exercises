module Main exposing (main)

import Browser
import Browser.Dom as Dom
import Element as Elm exposing (Element)
import Element.Background as Background
import Element.Border as Border
import Element.Font as Font
import Element.Input as Input
import Element.Region as Region
import Html exposing (Html)
import Html.Attributes as HtmlAttr
import Task


type Msg
    = Input String
    | Focus (Result Dom.Error ())
    | Get
    | GetResult (Result Dom.Error Dom.Viewport)
    | Set Float
    | SetResult (Result Dom.Error ())
    | GetElement String
    | GetElementResult (Result Dom.Error Dom.Element)


type alias Model =
    ()


type alias Flags =
    ()


main : Program Flags Model Msg
main =
    Browser.element
        { init = init
        , view = \_ -> Elm.layout [] myRowOfStuff
        , update = update
        , subscriptions = subscriptions
        }


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( (), Cmd.none )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Get ->
            ( model
            , Task.attempt GetResult (Dom.getViewportOf "select-test")
            )

        GetResult result ->
            case result of
                Ok v ->
                    let
                        _ =
                            Debug.log "viewport" v
                    in
                    ( model, Cmd.none )

                Err err ->
                    let
                        _ =
                            Debug.log "error" err
                    in
                    ( model, Cmd.none )

        GetElement id ->
            ( model
            , Task.attempt GetElementResult (Dom.getElement <| Debug.log "element_id" id)
            )

        GetElementResult result ->
            case result of
                Ok e ->
                    let
                        _ =
                            Debug.log "element" e
                    in
                    update (Set <| (e.element.height + 5) * 84) model

                Err err ->
                    let
                        _ =
                            Debug.log "error" err
                    in
                    ( model, Cmd.none )

        Set y ->
            ( model
            , Task.attempt SetResult (Dom.setViewportOf "select-test" 0 y)
            )

        SetResult result ->
            case result of
                Ok _ ->
                    ( model, Cmd.none )

                Err err ->
                    let
                        _ =
                            Debug.log "error" err
                    in
                    ( model, Cmd.none )

        _ ->
            ( model, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


myRowOfStuff : Element Msg
myRowOfStuff =
    Elm.column
        [ Elm.spacing 10
        , Elm.height Elm.shrink
        ]
        [ Elm.row
            [ Elm.width Elm.fill
            , Elm.centerY
            , Elm.spacing 30
            ]
            [ myElement
            , myElement
            , Elm.el [ Elm.alignRight ] myElement
            , myElement
            ]
        , Input.text [ Elm.htmlAttribute <| HtmlAttr.id "input-test" ]
            { onChange = Input
            , text = ""
            , placeholder = Just (Input.placeholder [] (Elm.text "ph"))
            , label = Input.labelLeft [] (Elm.text "label")
            }
        , Elm.column
            [ Elm.width (Elm.px 100)
            , Elm.height (Elm.px 300)
            , Border.width 1
            , Elm.scrollbarY
            , Elm.spacing 5
            , Elm.htmlAttribute <| HtmlAttr.id "select-test"
            ]
          <|
            List.map
                (\i ->
                    Elm.el
                        [ Elm.htmlAttribute <| HtmlAttr.id ("step-" ++ String.fromInt i)
                        , Elm.width Elm.fill
                        ]
                    <|
                        Elm.text <|
                            String.fromInt i
                )
            <|
                List.range 0 120
        , Elm.row []
            [ Elm.el
                [ Elm.below (Elm.text "I'm below!")
                ]
                (Elm.text "I'm normal!")
            ]
        , Elm.el
            [ Elm.onRight (Elm.text "!!")
            ]
            (Elm.text "column")
        , Elm.el
            [ Region.navigation
            ]
            (Elm.text "navigation")
        , Input.button [ Border.width 1 ]
            { onPress = Just Get
            , label = Elm.text "GET"
            }
        , Input.button [ Border.width 1 ]
            { onPress = Just <| Set 300
            , label = Elm.text "SET"
            }
        , Input.button [ Border.width 1 ]
            { onPress = Just <| GetElement "step-1"
            , label = Elm.text "GetElement"
            }
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
